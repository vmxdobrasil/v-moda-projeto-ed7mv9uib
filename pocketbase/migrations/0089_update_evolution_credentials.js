migrate(
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      const configs = app.findRecordsByFilter(
        'whatsapp_configs',
        'user = {:user}',
        '-created',
        1,
        0,
        { user: user.id },
      )

      let config
      if (configs && configs.length > 0) {
        config = configs[0]
      } else {
        const col = app.findCollectionByNameOrId('whatsapp_configs')
        config = new Record(col)
        config.set('user', user.id)
      }

      config.set('api_url', 'https://evolution-evolution.6xxwvj.easypanel.host')
      config.set('token', '7i5UsFq1MM8pEbt8NqCVDPglfY8v9LTd')

      const existingInstanceId = config.getString('instance_id')
      if (!existingInstanceId) {
        config.set('instance_id', 'vmoda_whatsapp')
      }

      app.save(config)
    } catch (err) {
      app.logger().error('Failed to seed evolution credentials', 'err', String(err))
    }
  },
  (app) => {
    // Migration is non-destructive, no revert needed.
  },
)
