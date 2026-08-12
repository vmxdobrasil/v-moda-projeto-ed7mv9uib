onRecordAfterCreateSuccess((e) => {
  const record = e.record
  const manufacturerId = record.getString('manufacturer')
  if (!manufacturerId) return e.next()

  const notifCol = $app.findCollectionByNameOrId('notifications')
  const notif = new Record(notifCol)
  notif.set('user', manufacturerId)
  notif.set('title', 'Novo Lead Recebido')

  const name = record.getString('name') || record.getString('email') || 'Contato Site'
  notif.set('message', 'Você recebeu um novo lead: ' + name)
  notif.set('read', false)

  $app.save(notif)

  try {
    const adminNotifCol = $app.findCollectionByNameOrId('notifications')
    const adminNotif = new Record(adminNotifCol)
    adminNotif.set('title', 'Novo Lead Recebido')
    adminNotif.set('message', 'Você recebeu um novo lead: ' + name)
    adminNotif.set('read', false)
    $app.save(adminNotif)
  } catch (adminErr) {
    $app.logger().error('Failed to create admin notification', 'error', adminErr.message)
  }

  return e.next()
}, 'customers')
