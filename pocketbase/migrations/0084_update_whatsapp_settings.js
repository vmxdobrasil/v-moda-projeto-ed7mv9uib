migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('whatsapp_configs')
    const tokenField = col.fields.getByName('token')
    if (tokenField) {
      tokenField.hidden = true
    }
    app.save(col)

    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      let config
      try {
        config = app.findFirstRecordByData('whatsapp_configs', 'user', admin.id)
      } catch (_) {
        config = new Record(col)
        config.set('user', admin.id)
      }
      config.set('api_url', 'https://evolution-evolution.6xxwvj.easypanel.host')
      config.set('token', '7i5UsFq1MM8pEbt8NqCVDPglfY8v9LTd')
      if (!config.get('instance_id')) {
        config.set('instance_id', 'vmoda_master')
      }
      app.save(config)
    } catch (err) {
      console.log('Admin user not found or error seeding: ', err)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('whatsapp_configs')
    const tokenField = col.fields.getByName('token')
    if (tokenField) {
      tokenField.hidden = false
    }
    app.save(col)
  },
)
