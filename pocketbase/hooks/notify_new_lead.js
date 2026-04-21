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

  return e.next()
}, 'customers')
