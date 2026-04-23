migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const roleField = users.fields.getByName('role')

    if (roleField && roleField.type === 'select') {
      const vals = Array.from(roleField.values || [])
      if (!vals.includes('admin')) {
        vals.push('admin')
        users.fields.add(
          new SelectField({
            name: 'role',
            maxSelect: 1,
            values: vals,
          }),
        )
        app.save(users)
      }
    } else if (!roleField) {
      users.fields.add(
        new SelectField({
          name: 'role',
          maxSelect: 1,
          values: ['user', 'admin'],
        }),
      )
      app.save(users)
    }

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
