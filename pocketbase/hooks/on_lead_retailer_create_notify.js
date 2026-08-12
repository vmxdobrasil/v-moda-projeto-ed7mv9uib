onRecordAfterCreateSuccess((e) => {
  const record = e.record
  try {
    const adminNotifCol = $app.findCollectionByNameOrId('notifications')
    const adminNotif = new Record(adminNotifCol)
    adminNotif.set('title', 'Novo lead de lojista')
    adminNotif.set(
      'message',
      'Novo lead de lojista: ' +
        (record.getString('store_name') || 'Sem nome') +
        ' - ' +
        (record.getString('city') || '') +
        '/' +
        (record.getString('state') || ''),
    )
    adminNotif.set('read', false)
    $app.save(adminNotif)
  } catch (adminErr) {
    $app.logger().error('Failed to create admin notification', 'error', adminErr.message)
  }
  return e.next()
}, 'leads_retailers')
