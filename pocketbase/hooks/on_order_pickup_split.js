onRecordAfterUpdateSuccess((e) => {
  const record = e.record
  const original = record.original()

  const oldStatus = original.getString('status')
  const newStatus = record.getString('status')
  const isPickup = record.getBool('is_pickup')

  if (oldStatus !== 'paid' && newStatus === 'paid' && isPickup) {
    const totalAmount = record.getFloat('total_amount')
    const partnerId = record.getString('pickup_partner_id')
    const sellerId = record.getString('seller_id')

    var platformRate = 0.1389
    var retailerRate = 0.05
    var manufacturerRate = 1 - platformRate - retailerRate

    var platformShare = totalAmount * platformRate
    var retailerShare = totalAmount * retailerRate
    var manufacturerShare = totalAmount * manufacturerRate

    var splitDetails = {
      platform_share: platformShare,
      retailer_share: retailerShare,
      manufacturer_share: manufacturerShare,
      platform_rate: platformRate,
      retailer_rate: retailerRate,
      manufacturer_rate: manufacturerRate,
    }

    var qrCode = $security.randomString(12)

    try {
      var updatedRecord = $app.findRecordById('orders', record.id)
      updatedRecord.set('pickup_qr_code', qrCode)
      updatedRecord.set('split_json', JSON.stringify(splitDetails))
      $app.save(updatedRecord)
    } catch (err) {
      $app.logger().error('Failed to save pickup QR', 'orderId', record.id, 'error', err.message)
    }

    if (sellerId) {
      var finCol = $app.findCollectionByNameOrId('financial_transactions')
      var today = new Date().toISOString().split('T')[0]

      try {
        var mfgTx = new Record(finCol)
        mfgTx.set('store', sellerId)
        mfgTx.set('type', 'receivable')
        mfgTx.set('category', 'manufacturer_share')
        mfgTx.set('amount', manufacturerShare)
        mfgTx.set('due_date', today)
        mfgTx.set('status', 'pending')
        mfgTx.set('description', 'Repasse fabricante - Pedido ' + record.id)
        mfgTx.set('order', record.id)
        $app.save(mfgTx)
      } catch (err) {
        $app.logger().error('Mfg tx failed', 'orderId', record.id, 'error', err.message)
      }

      try {
        var platTx = new Record(finCol)
        platTx.set('store', sellerId)
        platTx.set('type', 'payable')
        platTx.set('category', 'platform_commission')
        platTx.set('amount', platformShare)
        platTx.set('due_date', today)
        platTx.set('status', 'pending')
        platTx.set('description', 'Comissao plataforma - Pedido ' + record.id)
        platTx.set('order', record.id)
        $app.save(platTx)
      } catch (err) {
        $app.logger().error('Platform tx failed', 'orderId', record.id, 'error', err.message)
      }

      if (partnerId) {
        try {
          var retTx = new Record(finCol)
          retTx.set('store', sellerId)
          retTx.set('type', 'payable')
          retTx.set('category', 'pickup_service_fee')
          retTx.set('amount', retailerShare)
          retTx.set('due_date', today)
          retTx.set('status', 'pending')
          retTx.set('description', 'Taxa retirada local - Pedido ' + record.id)
          retTx.set('customer', partnerId)
          retTx.set('order', record.id)
          $app.save(retTx)
        } catch (err) {
          $app.logger().error('Retailer tx failed', 'orderId', record.id, 'error', err.message)
        }

        try {
          var partner = $app.findRecordById('customers', partnerId)
          var phone = partner.getString('phone')

          if (phone) {
            var config = null
            try {
              config = $app.findFirstRecordByData('whatsapp_configs', 'user', sellerId)
            } catch (_) {}

            if (config) {
              var apiUrl = config.getString('api_url')
              var token = config.getString('token')
              var instanceId = config.getString('instance_id') || 'Evolution'

              if (apiUrl && apiUrl.indexOf('evolution') !== -1) {
                var base = apiUrl.replace(/\/$/, '')
                var endpoint = base + '/message/sendText/' + instanceId
                var msg =
                  'Nova retirada confirmada para sua unidade. Pedido: ' +
                  record.id +
                  '. Codigo de retirada: ' +
                  qrCode

                try {
                  $http.send({
                    url: endpoint,
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      apikey: token,
                    },
                    body: JSON.stringify({
                      number: phone,
                      textMessage: { text: msg },
                    }),
                    timeout: 10,
                  })
                } catch (httpErr) {
                  $app
                    .logger()
                    .error('WhatsApp send failed', 'orderId', record.id, 'error', httpErr.message)
                }
              }
            }

            var notifCol = $app.findCollectionByNameOrId('notifications')
            var notif = new Record(notifCol)
            notif.set('user', sellerId)
            notif.set('title', 'Nova Retirada Confirmada')
            notif.set(
              'message',
              'Pedido ' +
                record.id +
                ' - Codigo: ' +
                qrCode +
                ' - Parceiro: ' +
                partner.getString('name'),
            )
            notif.set('read', false)
            $app.save(notif)
          }
        } catch (err) {
          $app
            .logger()
            .error('Partner notification failed', 'orderId', record.id, 'error', err.message)
        }
      }
    }
  }

  return e.next()
}, 'orders')
