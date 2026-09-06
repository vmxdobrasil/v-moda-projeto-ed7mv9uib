onRecordAfterUpdateSuccess((e) => {
  const newStatus = e.record.getString('status')
  const oldStatus = e.record.original().getString('status')

  if (!newStatus || newStatus === oldStatus) {
    return e.next()
  }

  const triggerMap = {
    interested: 'status_interested',
    negotiating: 'status_negotiating',
    converted: 'status_converted',
    inactive: 'status_inactive',
  }

  const trigger = triggerMap[newStatus]
  if (!trigger) return e.next()

  try {
    const adminNotifCol = $app.findCollectionByNameOrId('notifications')
    const adminNotif = new Record(adminNotifCol)
    adminNotif.set('title', 'Cliente mudou de status')
    adminNotif.set(
      'message',
      'O cliente ' +
        (e.record.getString('name') || 'Sem nome') +
        ' mudou para o status ' +
        newStatus +
        '.',
    )
    adminNotif.set('read', false)
    $app.save(adminNotif)
  } catch (notifErr) {
    $app.logger().error('Failed to create admin notification', 'error', notifErr.message)
  }

  const manufacturerId = e.record.getString('manufacturer')
  if (!manufacturerId) return e.next()

  try {
    const templates = $app.findRecordsByFilter(
      'whatsapp_templates',
      `user = {:user} && trigger_event = {:trigger} && is_active = true`,
      '-created',
      1,
      0,
      {
        user: manufacturerId,
        trigger: trigger,
      },
    )

    if (!templates || templates.length === 0) return e.next()

    const template = templates[0]

    let phone = e.record.getString('phone')
    if (!phone) return e.next()

    let content = template.getString('content')
    content = content.replace(/\{nome\}/g, e.record.getString('name') || 'Cliente')
    content = content.replace(/\{\{name\}\}/g, e.record.getString('name') || 'Cliente')

    const sendResult = $whatsappRotator.sendWithRotation({
      userId: manufacturerId,
      phone: phone,
      message: content,
    })

    if (!sendResult.success) {
      $app
        .logger()
        .error(
          'Failed to send WhatsApp status notification via rotation',
          'error',
          sendResult.error,
        )
    } else {
      $app
        .logger()
        .info(
          'WhatsApp status notification sent successfully via ' + sendResult.instance,
          'customer',
          e.record.id,
          'status',
          newStatus,
          'label',
          sendResult.label,
        )
    }
  } catch (err) {
    $app.logger().error('Error in status change WhatsApp hook', 'error', err.message)
  }

  return e.next()
}, 'customers')
