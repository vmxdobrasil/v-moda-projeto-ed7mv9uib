migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const email = 'valterpmendonca@gmail.com'

    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', email)
      record.set('role', 'admin')
      record.setVerified(true)
      app.save(record)
    } catch (_) {
      const record = new Record(users)
      record.setEmail(email)
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('role', 'admin')
      record.set('name', 'Admin Valter')
      app.save(record)
    }
  },
  (app) => {
    // Safe to leave
  },
)
