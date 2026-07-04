routerAdd(
  'POST',
  '/backend/v1/asaas/payments',
  (e) => {
    const body = e.requestInfo().body || {}
    const { amount, method, externalReference, customerName, customerEmail, customerCpfCnpj } = body

    const asaasUrl = $secrets.get('ASAAS_API_URL') || 'https://api.asaas.com/v3'
    const apiKey = $secrets.get('ASAAS_API_KEY')
    if (!apiKey) {
      return e.internalServerError(
        'A configuração do gateway de pagamento (Asaas) está ausente no sistema.',
      )
    }

    // Busy-wait sleep function (Goja does not support async setTimeout)
    function sleep(ms) {
      const start = Date.now()
      while (Date.now() - start < ms) {}
    }

    // Fetch with exponential backoff retry for network/timeout resilience
    function fetchRetry(url, options) {
      const retries = [2000, 4000, 8000]
      for (let i = 0; i <= retries.length; i++) {
        try {
          const res = $http.send({ url, ...options, timeout: 15 })
          if (res.statusCode >= 200 && res.statusCode < 300) return res
          // Do not retry 4xx errors (client errors/validation) except 429 Rate Limit
          if (res.statusCode >= 400 && res.statusCode < 500 && res.statusCode !== 429) {
            return res
          }
          throw new Error(`HTTP ${res.statusCode}`)
        } catch (err) {
          if (i === retries.length) throw err
          sleep(retries[i])
        }
      }
    }

    try {
      // 1. Create or ensure customer exists
      const custRes = fetchRetry(asaasUrl + '/customers', {
        method: 'POST',
        headers: { access_token: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName || 'Cliente Plataforma V Moda',
          email: customerEmail || 'cliente@vmoda.com.br',
          cpfCnpj: customerCpfCnpj,
        }),
      })

      if (custRes.statusCode >= 400) {
        $app
          .logger()
          .error('Asaas customer creation failed', 'details', JSON.stringify(custRes.json))
        return e.badRequestError('Erro de validação ao criar o cliente no Asaas', custRes.json)
      }

      const asaasCustomerId = custRes.json.id

      // 2. Create Charge
      // Automatically set dueDate to tomorrow
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

      const payload = {
        customer: asaasCustomerId,
        billingType: method || 'PIX', // PIX, BOLETO, CREDIT_CARD
        value: Number(amount),
        dueDate: tomorrow,
        externalReference: externalReference,
      }

      const payRes = fetchRetry(asaasUrl + '/payments', {
        method: 'POST',
        headers: { access_token: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (payRes.statusCode >= 400) {
        $app.logger().error('Asaas payment creation failed', 'details', JSON.stringify(payRes.json))
        return e.badRequestError(
          'A transação foi recusada pela operadora ou dados inválidos',
          payRes.json,
        )
      }

      const paymentData = payRes.json

      // 3. Fetch PIX QR Code if applicable
      if (method === 'PIX') {
        const qrRes = fetchRetry(`${asaasUrl}/payments/${paymentData.id}/pixQrCode`, {
          method: 'GET',
          headers: { access_token: apiKey },
        })
        if (qrRes.statusCode === 200) {
          paymentData.pixQrCode = qrRes.json
        }
      }

      return e.json(200, paymentData)
    } catch (err) {
      $app.logger().error('Asaas payment failed after retries', 'error', err.message)
      return e.internalServerError(
        'Falha na comunicação com o gateway de pagamento. Tente novamente mais tarde.',
      )
    }
  },
  $apis.requireAuth(),
)
