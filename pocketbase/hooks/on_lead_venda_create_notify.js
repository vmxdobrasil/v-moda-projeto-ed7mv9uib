onRecordAfterCreateSuccess((e) => {
  const record = e.record
  try {
    const adminNotifCol = $app.findCollectionByNameOrId('notifications')
    const adminNotif = new Record(adminNotifCol)
    adminNotif.set('title', 'Novo lead de venda')
    adminNotif.set('message', 'Novo lead de venda criado no sistema. ID: ' + record.id)
    adminNotif.set('read', false)
    $app.save(adminNotif)
  } catch (adminErr) {
    $app.logger().error('Failed to create admin notification', 'error', adminErr.message)
  }
  return e.next()
}, 'leads_venda')
