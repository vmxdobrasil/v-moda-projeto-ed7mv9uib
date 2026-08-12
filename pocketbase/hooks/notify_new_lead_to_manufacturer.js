onRecordAfterCreateSuccess((e) => {
  const customer = e.record
  const manufacturerId = customer.getString('manufacturer')

  if (!manufacturerId) return e.next()

  try {
    const notifications = $app.findCollectionByNameOrId('notifications')
    const notif = new Record(notifications)

    notif.set('user', manufacturerId)
    notif.set('title', 'Novo Lead Capturado')
    notif.set(
      'message',
      `Um novo lead (${customer.getString('name') || 'Sem nome'}) foi adicionado ao seu CRM.`,
    )
    notif.set('read', false)

    $app.save(notif)
  } catch (err) {
    $app
      .logger()
      .error(
        'Falha ao notificar o fabricante sobre o novo lead.',
        'error',
        err.message,
        'customer',
        customer.id,
      )
  }

  try {
    const adminNotifCol = $app.findCollectionByNameOrId('notifications')
    const adminNotif = new Record(adminNotifCol)
    adminNotif.set('title', 'Novo Lead Capturado')
    adminNotif.set(
      'message',
      'Um novo lead (' + (customer.getString('name') || 'Sem nome') + ') foi adicionado ao CRM.',
    )
    adminNotif.set('read', false)
    $app.save(adminNotif)
  } catch (adminErr) {
    $app.logger().error('Failed to create admin notification', 'error', adminErr.message)
  }

  return e.next()
}, 'customers')
