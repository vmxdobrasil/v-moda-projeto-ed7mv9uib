routerAdd(
  'POST',
  '/backend/v1/delivery/verify',
  (e) => {
    const body = e.requestInfo().body || {}
    const token = body.token

    if (!token) {
      return e.badRequestError('Token is required')
    }

    try {
      const cargo = $app.findFirstRecordByFilter('cargas_transporte', 'qr_code_token = {:token}', {
        token: token,
      })

      if (cargo.getString('delivery_status') === 'delivered') {
        return e.json(200, { success: false, message: 'Esta carga já foi entregue.' })
      }

      cargo.set('delivery_status', 'delivered')
      $app.save(cargo)

      const customerId = cargo.getString('customer')
      if (customerId) {
        try {
          const customer = $app.findRecordById('customers', customerId)
          customer.set('logistics_status', 'Entregue')
          $app.save(customer)
        } catch (_) {}
      }

      return e.json(200, {
        success: true,
        message: 'Entrega confirmada com sucesso!',
        cargo_id: cargo.id,
      })
    } catch (err) {
      return e.notFoundError('Token QR inválido ou não encontrado.')
    }
  },
  $apis.requireAuth(),
)
