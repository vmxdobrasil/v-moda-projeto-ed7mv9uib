onRecordAfterUpdateSuccess((e) => {
  const record = e.record
  const original = record.original()

  const oldStatus = original.getString('status')
  const newStatus = record.getString('status')
  const isPickup = record.getBool('is_pickup')

  if (oldStatus !== 'paid' && newStatus === 'paid' && isPickup) {
    if (record.getString('pickup_qr_code')) return e.next()

    const pickupCode = $security.randomString(12).toUpperCase()
    const totalAmount = record.getFloat('total_amount')
    const platformShare = +(totalAmount * 0.1).toFixed(2)
    const retailerShare = +(totalAmount * 0.1).toFixed(2)
    const manufacturerShare = +(totalAmount - platformShare - retailerShare).toFixed(2)

    const splitJson = {
      manufacturer_share: manufacturerShare,
      retailer_share: retailerShare,
      platform_share: platformShare,
      total: totalAmount,
    }

    const order = $app.findRecordById('orders', record.id)
    order.set('pickup_qr_code', pickupCode)
    order.set('split_json', splitJson)
    $app.saveNoValidate(order)

    const partnerId = record.getString('pickup_partner_id')
    const sellerId = record.getString('seller_id')
    const today = new Date().toISOString().split('T')[0]

    if (partnerId) {
      try {
        const partner = $app.findRecordById('customers', partnerId)
        const finCol = $app.findCollectionByNameOrId('financial_transactions')

        if (sellerId) {
          const mfrTx = new Record(finCol)
          mfrTx.set('store', sellerId)
          mfrTx.set('type', 'receivable')
          mfrTx.set('category', 'pickup_sale')
          mfrTx.set('amount', manufacturerShare)
          mfrTx.set('due_date', today)
          mfrTx.set('status', 'pending')
          mfrTx.set('description', 'Venda Click & Collect - Pedido ' + record.id)
          mfrTx.set('order', record.id)
          mfrTx.set('customer', partnerId)
          $app.save(mfrTx)

          const retTx = new Record(finCol)
          retTx.set('store', sellerId)
          retTx.set('type', 'payable')
          retTx.set('category', 'pickup_fee_partner')
          retTx.set('amount', retailerShare)
          retTx.set('due_date', today)
          retTx.set('status', 'pending')
          retTx.set('description', 'Taxa Click & Collect - ' + partner.getString('name'))
          retTx.set('order', record.id)
          retTx.set('customer', partnerId)
          $app.save(retTx)
        }

        const partnerPhone = partner.getString('phone')
        if (partnerPhone && sellerId) {
          let config = null
          try {
            config = $app.findFirstRecordByData('whatsapp_configs', 'user', sellerId)
          } catch (_) {}

          if (config) {
            const apiUrl = config.get('api_url')
            const token = config.get('token')
            const instanceId = config.get('instance_id') || 'Evolution'
            const msg =
              'Nova retirada confirmada para sua unidade. Pedido: ' +
              record.id +
              '. Codigo: ' +
              pickupCode

            try {
              let endpoint = apiUrl
              let reqBody = { phone: partnerPhone, message: msg }
              let reqHeaders = {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
              }

              if (apiUrl.includes('evolution')) {
                endpoint = apiUrl.replace(/\/$/, '') + '/message/sendText/' + instanceId
                reqHeaders['apikey'] = token
                reqBody = { number: partnerPhone, textMessage: { text: msg } }
              }

              $http.send({
                url: endpoint,
                method: 'POST',
                headers: reqHeaders,
                body: JSON.stringify(reqBody),
                timeout: 10,
              })
            } catch (err) {
              $app
                .logger()
                .error('Pickup WhatsApp failed', 'orderId', record.id, 'error', err.message)
            }
          }
        }
      } catch (err) {
        $app
          .logger()
          .error('Pickup order processing failed', 'orderId', record.id, 'error', err.message)
      }
    }
  }

  return e.next()
}, 'orders')
