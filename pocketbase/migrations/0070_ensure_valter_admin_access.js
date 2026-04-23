migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      const existing = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      existing.setVerified(true)
      existing.set('role', 'manufacturer')
      existing.set('name', 'Valter Mendonça')
      app.save(existing)
    } catch (_) {
      const record = new Record(users)
      record.setEmail('valterpmendonca@gmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Valter Mendonça')
      record.set('role', 'manufacturer')
      app.save(record)
    }
  },
  (app) => {
    // down migration not required for data seed safety
  },
)
