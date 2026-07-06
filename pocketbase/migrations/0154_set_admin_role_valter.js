migrate(
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')
      if (record.getString('role') !== 'admin') {
        record.set('role', 'admin')
        app.save(record)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')
      record.set('role', 'manufacturer')
      app.save(record)
    } catch (_) {}
  },
)
