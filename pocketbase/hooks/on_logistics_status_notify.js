onRecordAfterUpdateSuccess((e) => {
  const record = e.record
  const original = record.original()

  const status = record.getString('logistics_status')
  const oldStatus = original.getString('logistics_status')

  if (status === 'Entregue' && status !== oldStatus) {
    const collection = $app.findCollectionByNameOrId('notifications')
    const notif = new Record(collection)

    const manufacturerId = record.getString('manufacturer')
    const affiliateId = record.getString('affiliate_referrer')
    let userId = manufacturerId || affiliateId

    if (!userId) {
      try {
        const admin = $app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
        userId = admin.id
      } catch (_) {}
    }

    if (userId) {
      notif.set('user', userId)
      notif.set('title', 'Logística: Pedido Entregue')
      notif.set(
        'message',
        `A entrega para o cliente ${record.getString('name') || 'Sem Nome'} foi concluída com sucesso.`,
      )
      notif.set('read', false)
      $app.save(notif)
    }
  }

  e.next()
}, 'customers')
