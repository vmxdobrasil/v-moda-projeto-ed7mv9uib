onRecordAfterCreateSuccess((e) => {
  const record = e.record
  const source = record.get('source')

  if (source === 'manual' || source === 'site' || source === 'email') {
    try {
      const notifications = $app.findCollectionByNameOrId('notifications')
      const notif = new Record(notifications)
      notif.set('user', record.get('manufacturer'))
      notif.set('title', 'Novo Interesse Capturado!')
      notif.set(
        'message',
        'Um novo cliente demonstrou interesse em seu perfil. Verifique os detalhes no CRM.',
      )
      notif.set('read', false)
      $app.save(notif)
    } catch (err) {
      console.log('Error creating notification: ', err)
    }
  }

  e.next()
}, 'customers')
