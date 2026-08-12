onRecordAfterUpdateSuccess((e) => {
  const oldStatus = e.record.original().getString('status')
  const newStatus = e.record.getString('status')
  const oldLogistics = e.record.original().getString('logistics_status')
  const newLogistics = e.record.getString('logistics_status')

  if (oldStatus !== newStatus || oldLogistics !== newLogistics) {
    try {
      const manufacturerId = e.record.getString('manufacturer')
      if (manufacturerId) {
        const notif = new Record($app.findCollectionByNameOrId('notifications'))
        notif.set('user', manufacturerId)
        notif.set('title', 'Atualização de Cliente')

        if (oldStatus !== newStatus) {
          notif.set(
            'message',
            `Status do cliente ${e.record.getString('name')} mudou para ${newStatus}.`,
          )
        } else {
          notif.set(
            'message',
            `Logística do cliente ${e.record.getString('name')} mudou para ${newLogistics}.`,
          )
        }

        $app.save(notif)
      }
    } catch (err) {}

    try {
      const adminNotifCol = $app.findCollectionByNameOrId('notifications')
      const adminNotif = new Record(adminNotifCol)
      adminNotif.set('title', 'Atualização de Cliente')
      if (oldStatus !== newStatus) {
        adminNotif.set(
          'message',
          'O cliente ' +
            (e.record.getString('name') || 'Sem nome') +
            ' mudou para o status ' +
            newStatus +
            '.',
        )
      } else {
        adminNotif.set(
          'message',
          'A logística do cliente ' +
            (e.record.getString('name') || 'Sem nome') +
            ' mudou para ' +
            newLogistics +
            '.',
        )
      }
      adminNotif.set('read', false)
      $app.save(adminNotif)
    } catch (adminErr) {
      $app.logger().error('Failed to create admin notification', 'error', adminErr.message)
    }
  }

  e.next()
}, 'customers')
