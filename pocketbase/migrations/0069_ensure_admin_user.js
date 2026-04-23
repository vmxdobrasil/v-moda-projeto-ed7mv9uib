migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      record.setVerified(true)
      record.set('is_verified', true)
      app.save(record)
    } catch (_) {
      const record = new Record(users)
      record.setEmail('valterpmendonca@gmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('is_verified', true)
      record.set('name', 'Admin')
      app.save(record)
    }
  },
  (app) => {
    // Down migration intentionally empty to preserve admin user
  },
)
