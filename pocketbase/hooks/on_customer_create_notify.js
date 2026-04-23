onRecordAfterCreateSuccess((e) => {
  const record = e.record
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
    notif.set('title', 'Novo Lead Adicionado')
    notif.set(
      'message',
      `Um novo lead (${record.getString('name') || 'Sem Nome'}) foi adicionado à sua base de clientes.`,
    )
    notif.set('read', false)
    $app.save(notif)
  }

  e.next()
}, 'customers')
