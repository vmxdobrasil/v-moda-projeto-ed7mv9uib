onRecordAfterUpdateSuccess((e) => {
  const newStatus = e.record.getString('logistics_status')
  const oldStatus = e.record.original().getString('logistics_status')

  if (newStatus === 'Entregue' && oldStatus !== 'Entregue') {
    const manufacturer =
      e.record.getString('manufacturer') || e.record.getString('affiliate_referrer')

    if (manufacturer) {
      try {
        const notifications = $app.findCollectionByNameOrId('notifications')
        const notif = new Record(notifications)
        notif.set('user', manufacturer)
        notif.set('title', 'Logística: Entrega Concluída')
        notif.set(
          'message',
          `A entrega para o cliente ${e.record.getString('name') || 'desconhecido'} foi finalizada com sucesso.`,
        )
        notif.set('read', false)
        $app.save(notif)
      } catch (err) {
        console.log('Error creating logistics notification: ', err)
      }
    }
  }

  return e.next()
}, 'customers')
