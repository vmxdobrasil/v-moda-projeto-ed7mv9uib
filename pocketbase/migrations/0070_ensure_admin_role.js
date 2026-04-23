migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    const roleField = users.fields.getByName('role')
    if (roleField) {
      const vals = roleField.values || []
      const arr = []
      for (let i = 0; i < vals.length; i++) {
        arr.push(vals[i])
      }

      if (!arr.includes('admin')) {
        arr.push('admin')
        roleField.values = arr
        app.save(users)
      }
    }

    try {
      const record = app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')
      if (record.getString('role') !== 'admin') {
        record.set('role', 'admin')
        app.save(record)
      }
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('valterpmendonca@gmail.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Admin')
    record.set('role', 'admin')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')
      if (record.getString('role') === 'admin') {
        record.set('role', '')
        app.save(record)
      }
    } catch (_) {}
  },
)
