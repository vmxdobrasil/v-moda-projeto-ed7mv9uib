migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('whatsapp_configs')

    if (!col.fields.getByName('token')) {
      col.fields.add(new TextField({ name: 'token' }))
      app.save(col)
    }

    const configs = app.findRecordsByFilter('whatsapp_configs', '1=1', '', 1000, 0)
    for (const config of configs) {
      config.set('api_url', 'https://evolution-evolution.6xxwvj.easypanel.host')
      config.set('token', '7i5UsFq1MM8pEbt8NqCVDPglfY8v9LTd')
      app.saveNoValidate(config)
    }

    try {
      const adminUser = app.findFirstRecordByData('users', 'email', 'valterpmendonca@gmail.com')
      try {
        app.findFirstRecordByData('whatsapp_configs', 'user', adminUser.id)
      } catch (_) {
        const newConfig = new Record(col)
        newConfig.set('user', adminUser.id)
        newConfig.set('api_url', 'https://evolution-evolution.6xxwvj.easypanel.host')
        newConfig.set('token', '7i5UsFq1MM8pEbt8NqCVDPglfY8v9LTd')
        newConfig.set('instance_id', 'vmoda')
        app.save(newConfig)
      }
    } catch (_) {}
  },
  (app) => {
    // Safe to revert, but we keep the updated credentials
  },
)
