migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    let roleField = users.fields.getByName('role')
    if (!roleField) {
      roleField = new SelectField({
        name: 'role',
        values: ['admin', 'customer', 'partner'],
        maxSelect: 1,
      })
      users.fields.add(roleField)
    } else {
      const vals = roleField.values || []
      if (!vals.includes('admin')) {
        roleField.values = [...vals, 'admin']
      }
    }

    app.save(users)

    try {
      const record = app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')
      if (record.getString('role') !== 'admin') {
        app
          .db()
          .newQuery("UPDATE users SET role = 'admin' WHERE id = {:id}")
          .bind({ id: record.id })
          .execute()
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
