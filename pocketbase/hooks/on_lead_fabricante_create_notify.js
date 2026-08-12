onRecordAfterCreateSuccess((e) => {
  const record = e.record
  try {
    const adminNotifCol = $app.findCollectionByNameOrId('notifications')
    const adminNotif = new Record(adminNotifCol)
    adminNotif.set('title', 'Novo lead de fabricante')
    adminNotif.set(
      'message',
      'Novo lead de fabricante: ' +
        (record.getString('name') || 'Sem nome') +
        ' - WhatsApp: ' +
        (record.getString('whatsapp') || 'N/A'),
    )
    adminNotif.set('read', false)
    $app.save(adminNotif)
  } catch (adminErr) {
    $app.logger().error('Failed to create admin notification', 'error', adminErr.message)
  }
  return e.next()
}, 'leads_fabricantes')
