migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('whatsapp_configs')

    if (!col.fields.getByName('token')) {
      col.fields.add(new TextField({ name: 'token' }))
      app.save(col)
    }

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

      if (!config.getString('instance_id')) {
        config.set('instance_id', 'vmoda')
      }

      app.save(config)
    } catch (_) {
      // Admin user not found, skip
    }
  },
  (app) => {
    // Do nothing
  },
)
