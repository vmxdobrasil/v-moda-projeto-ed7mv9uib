migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Idempotent check: skip if user already exists
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('valterpmendonca@gmail.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Admin')
    record.set('role', 'admin') // Make sure the user has admin role if needed

    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
