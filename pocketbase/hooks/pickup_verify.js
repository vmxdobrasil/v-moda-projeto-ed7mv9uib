routerAdd(
  'POST',
  '/backend/v1/pickup/verify',
  (e) => {
    const body = e.requestInfo().body || {}
    const code = (body.code || '').trim().toUpperCase()

    if (!code) {
      return e.badRequestError('Codigo de retirada e obrigatorio')
    }

    try {
      const order = $app.findFirstRecordByFilter('orders', 'pickup_qr_code = {:code}', {
        code: code,
      })

      if (order.getString('status') !== 'paid') {
        return e.json(200, { success: false, message: 'Pedido nao esta pago.' })
      }

      order.set('status', 'delivered')
      $app.save(order)

      return e.json(200, {
        success: true,
        message: 'Retirada confirmada com sucesso!',
        order_id: order.id,
        total_amount: order.getFloat('total_amount'),
      })
    } catch (err) {
      return e.notFoundError('Codigo de retirada invalido ou nao encontrado.')
    }
  },
  $apis.requireAuth(),
)
