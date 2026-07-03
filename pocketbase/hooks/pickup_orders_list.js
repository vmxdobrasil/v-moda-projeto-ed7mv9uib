routerAdd(
  'GET',
  '/backend/v1/pickup/orders',
  (e) => {
    const userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    let phone = ''
    try {
      const user = $app.findRecordById('users', userId)
      phone = user.getString('phone') || ''
    } catch (_) {}

    if (!phone) return e.json(200, [])

    try {
      const orders = $app.findRecordsByFilter(
        'orders',
        'guest_phone = {:phone}',
        '-created',
        50,
        0,
        { phone: phone },
      )

      for (let i = 0; i < orders.length; i++) {
        try {
          $app.expandRecord(orders[i], ['pickup_partner_id'])
        } catch (_) {}
      }

      return e.json(200, orders)
    } catch (err) {
      return e.json(200, [])
    }
  },
  $apis.requireAuth(),
)
