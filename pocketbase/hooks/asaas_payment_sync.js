routerAdd(
  'GET',
  '/backend/v1/asaas/sync/{orderId}',
  (e) => {
    const orderId = e.request.pathValue('orderId')

    const asaasUrl = $secrets.get('ASAAS_API_URL') || 'https://sandbox.asaas.com/api/v3'
    const apiKey = $secrets.get('ASAAS_API_KEY')

    if (!apiKey) return e.internalServerError('Asaas API key not configured.')

    let res
    try {
      res = $http.send({
        url: `${asaasUrl}/payments?externalReference=${orderId}`,
        method: 'GET',
        headers: { access_token: apiKey },
        timeout: 15,
      })
    } catch (err) {
      return e.internalServerError('Failed to connect to Asaas API for synchronization.')
    }

    if (res.statusCode !== 200) {
      return e.badRequestError('Failed to fetch payment status from Asaas.')
    }

    const payments = res.json.data
    if (!payments || payments.length === 0) {
      return e.notFoundError('No payment found for this order.')
    }

    // Usually the latest payment is what matters
    const payment = payments[0]
    const isPaid = payment.status === 'RECEIVED' || payment.status === 'CONFIRMED'

    return $app.runInTransaction((txApp) => {
      let order
      try {
        order = txApp.findRecordById('orders', orderId)
      } catch (_) {
        return e.notFoundError('Order not found internally.')
      }

      let updated = false

      if (isPaid && order.getString('status') !== 'paid') {
        order.set('status', 'paid')
        txApp.save(order)
        updated = true

        try {
          const finTxs = txApp.findRecordsByFilter(
            'financial_transactions',
            "order = {:orderId} && status != 'paid'",
            '',
            100,
            0,
            { orderId: order.id },
          )
          for (const ftx of finTxs) {
            ftx.set('status', 'paid')
            txApp.save(ftx)
          }
        } catch (_) {}
      }

      return e.json(200, { paymentId: payment.id, status: payment.status, updated })
    })
  },
  $apis.requireAuth(),
)
