onRecordAfterCreateSuccess((e) => {
  const project = e.record
  const name = project.getString('name')

  try {
    // Notify the manufacturer that their product is live
    const manufacturerId = project.getString('manufacturer')
    if (manufacturerId) {
      const notif = new Record($app.findCollectionByNameOrId('notifications'))
      notif.set('user', manufacturerId)
      notif.set('title', 'Produto Adicionado')
      notif.set('message', `O produto ${name} foi publicado no catálogo.`)
      $app.save(notif)
    }
  } catch (err) {}

  e.next()
}, 'projects')
