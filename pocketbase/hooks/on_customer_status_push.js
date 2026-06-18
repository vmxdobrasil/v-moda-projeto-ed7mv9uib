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
  }

  e.next()
}, 'customers')
