migrate(
  (app) => {
    let user
    try {
      user = app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')
    } catch (_) {
      return // User not seeded yet
    }

    let config
    try {
      config = app.findFirstRecordByData('whatsapp_configs', 'user', user.id)
    } catch (_) {
      const col = app.findCollectionByNameOrId('whatsapp_configs')
      config = new Record(col)
      config.set('user', user.id)
    }

    config.set('api_url', 'https://evolution-evolution.6xxwvj.easypanel.host')
    config.set('token', '7i5UsFq1MM8pEbt8NqCVDPglfY8v9LTd')
    config.set('instance_id', 'vmoda_master')

    app.save(config)
  },
  (app) => {
    let user
    try {
      user = app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')
    } catch (_) {
      return
    }

    try {
      const config = app.findFirstRecordByData('whatsapp_configs', 'user', user.id)
      app.delete(config)
    } catch (_) {}
  },
)
