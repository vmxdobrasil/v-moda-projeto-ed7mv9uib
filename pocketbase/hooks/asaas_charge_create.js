routerAdd(
  'POST',
  '/backend/v1/asaas/charge',
  (e) => {
    const body = e.requestInfo().body || {}
    const { orderId, billingType, creditCard, customerInfo } = body

    const asaasUrl = $secrets.get('ASAAS_API_URL') || 'https://sandbox.asaas.com/api/v3'
    const apiKey = $secrets.get('ASAAS_API_KEY')

    if (!apiKey) {
      return e.internalServerError('Asaas API key not configured in secrets.')
    }

    // Exponential backoff retry logic: 2s, 4s, 8s
    function fetchWithRetry(url, options, maxRetries = 3) {
      let retries = 0
      const delays = [2000, 4000, 8000]

      while (retries <= maxRetries) {
        try {
          const res = $http.send({ url, ...options })

          if (res.statusCode >= 200 && res.statusCode < 300) {
            return res
          }

          // Do not retry on client errors, except rate limits (429)
          if (res.statusCode >= 400 && res.statusCode < 500 && res.statusCode !== 429) {
            return res
          }

          throw new Error(`HTTP ${res.statusCode}`)
        } catch (err) {
          if (retries === maxRetries) throw err

          const ms = delays[retries]
          const start = new Date().getTime()
          // Synchronous blocking sleep
          while (new Date().getTime() - start < ms) {
            /* busy wait */
          }
          retries++
        }
      }
    }

    return $app.runInTransaction((txApp) => {
      let order, customer
      try {
        order = txApp.findRecordById('orders', orderId)
      } catch (err) {
        return e.badRequestError('Order not found.')
      }

      const customerRelId = order.getString('customer')
      if (customerRelId) {
        try {
          customer = txApp.findRecordById('customers', customerRelId)
        } catch (_) {
          customer = null
        }
      }

      if (!customer) {
        const custCol = txApp.findCollectionByNameOrId('customers')
        customer = new Record(custCol)
        customer.set('name', order.getString('guest_name') || 'Cliente')
        customer.set('phone', order.getString('guest_phone') || '')
        if (customerInfo && customerInfo.email) customer.set('email', customerInfo.email)
        if (customerInfo && customerInfo.cpfCnpj) customer.set('tax_id', customerInfo.cpfCnpj)
        customer.set('status', 'new')
        customer.set('source', 'site')
        txApp.save(customer)
        order.set('customer', customer.id)
        txApp.save(order)
      }

      const amount = order.getFloat('total_amount')
      let asaasCustomerId = ''

      // 1. Create or Find Asaas Customer
      const custRes = fetchWithRetry(
        `${asaasUrl}/customers?cpfCnpj=${customer.getString('tax_id') || '00000000000'}`,
        {
          method: 'GET',
          headers: { access_token: apiKey },
          timeout: 15,
        },
      )

      if (
        custRes &&
        custRes.statusCode === 200 &&
        custRes.json.data &&
        custRes.json.data.length > 0
      ) {
        asaasCustomerId = custRes.json.data[0].id
      } else {
        const createCustRes = fetchWithRetry(`${asaasUrl}/customers`, {
          method: 'POST',
          headers: { access_token: apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: (customerInfo && customerInfo.name) || customer.getString('name'),
            cpfCnpj:
              (customerInfo && customerInfo.cpfCnpj) ||
              customer.getString('tax_id') ||
              '00000000000',
            email:
              (customerInfo && customerInfo.email) ||
              customer.getString('email') ||
              'cliente@example.com',
            phone: (customerInfo && customerInfo.phone) || customer.getString('phone'),
          }),
          timeout: 15,
        })

        if (createCustRes && createCustRes.statusCode >= 200 && createCustRes.statusCode < 300) {
          asaasCustomerId = createCustRes.json.id
        } else {
          return e.badRequestError(
            'Failed to create Asaas customer. Verification failed.',
            createCustRes ? createCustRes.json : null,
          )
        }
      }

      // 2. Create Charge
      const chargePayload = {
        customer: asaasCustomerId,
        billingType: billingType || 'PIX',
        value: amount,
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        externalReference: order.id,
        description: `Pagamento Pedido #${order.id.slice(0, 8).toUpperCase()}`,
      }

      if (billingType === 'CREDIT_CARD' && creditCard) {
        chargePayload.creditCard = {
          holderName: creditCard.holderName,
          number: creditCard.number,
          expiryMonth: creditCard.expiryMonth,
          expiryYear: creditCard.expiryYear,
          ccv: creditCard.ccv,
        }
        chargePayload.creditCardHolderInfo = {
          name: (customerInfo && customerInfo.name) || customer.getString('name'),
          email:
            (customerInfo && customerInfo.email) ||
            customer.getString('email') ||
            'cliente@vmoda.com.br',
          cpfCnpj:
            (customerInfo && customerInfo.cpfCnpj) || customer.getString('tax_id') || '00000000000',
          postalCode: (customerInfo && customerInfo.cep) || '',
          addressNumber: (customerInfo && customerInfo.addressNumber) || '',
          addressComplement: (customerInfo && customerInfo.addressComplement) || '',
          phone: (customerInfo && customerInfo.phone) || customer.getString('phone') || '',
          mobilePhone: (customerInfo && customerInfo.phone) || customer.getString('phone') || '',
        }
      }

      const chargeRes = fetchWithRetry(`${asaasUrl}/payments`, {
        method: 'POST',
        headers: { access_token: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(chargePayload),
        timeout: 15,
      })

      if (chargeRes && chargeRes.statusCode >= 200 && chargeRes.statusCode < 300) {
        const paymentData = chargeRes.json

        // 3. Update internal data
        order.set('payment_method', 'asaas')
        txApp.save(order)

        const storeId = order.getString('seller_id')
        if (storeId) {
          try {
            const txCol = txApp.findCollectionByNameOrId('financial_transactions')
            const newTx = new Record(txCol)
            newTx.set('store', storeId)
            newTx.set('type', 'receivable')
            newTx.set('amount', amount)
            newTx.set('due_date', chargePayload.dueDate)
            newTx.set('status', 'pending')
            newTx.set('order', order.id)
            newTx.set('customer', customer.id)
            newTx.set('description', `Cobrança Asaas: ${paymentData.id}`)
            txApp.save(newTx)
          } catch (err) {
            $app
              .logger()
              .error(
                'Failed to create financial_transaction for charge',
                'order',
                order.id,
                'error',
                err.message,
              )
          }
        }

        if ((billingType === 'PIX' || !billingType) && paymentData.id) {
          try {
            const qrRes = fetchWithRetry(`${asaasUrl}/payments/${paymentData.id}/pixQrCode`, {
              method: 'GET',
              headers: { access_token: apiKey },
              timeout: 15,
            })
            if (qrRes.statusCode === 200) {
              paymentData.pixQrCode = qrRes.json
            }
          } catch (_) {}
        }

        return e.json(200, paymentData)
      } else {
        $app
          .logger()
          .error(
            'Asaas Charge Error',
            'payload',
            chargePayload,
            'response',
            chargeRes ? chargeRes.json : null,
          )
        return e.badRequestError(
          'Failed to generate Asaas charge.',
          chargeRes ? chargeRes.json : { error: 'Unknown transport error' },
        )
      }
    })
  },
  $apis.requireAuth(),
)
