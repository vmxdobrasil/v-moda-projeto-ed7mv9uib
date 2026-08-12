onRecordAfterCreateSuccess((e) => {
  const record = e.record
  try {
    const manufacturer = record.getString('manufacturer') || record.getString('affiliate_referrer')
    if (manufacturer) {
      const notifications = $app.findCollectionByNameOrId('notifications')
      const notif = new Record(notifications)
      notif.set('user', manufacturer)
      notif.set('title', 'Novo Lead Capturado!')
      notif.set(
        'message',
        'Um novo cliente entrou no seu funil. Verifique os detalhes no CRM para iniciar o atendimento.',
      )
      notif.set('read', false)
      $app.save(notif)
    }
  } catch (err) {
    console.log('Error creating notification: ', err)
  }

  try {
    const adminNotifCol = $app.findCollectionByNameOrId('notifications')
    const adminNotif = new Record(adminNotifCol)
    adminNotif.set('title', 'Novo Lead Capturado!')
    adminNotif.set(
      'message',
      'Um novo cliente entrou no seu funil. Verifique os detalhes no CRM para iniciar o atendimento.',
    )
    adminNotif.set('read', false)
    $app.save(adminNotif)
  } catch (adminErr) {
    $app.logger().error('Failed to create admin notification', 'error', adminErr.message)
  }

  e.next()
}, 'customers')
