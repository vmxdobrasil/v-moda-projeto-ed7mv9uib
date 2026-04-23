migrate(
  (app) => {
    let users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Ensure the role field has "admin" in its values before saving the user
    let roleField = users.fields.getByName('role')
    if (roleField && roleField.type === 'select') {
      const currentValues = Array.from(roleField.values || [])
      if (!currentValues.includes('admin')) {
        currentValues.push('admin')
        users.fields.add(
          new SelectField({
            name: 'role',
            maxSelect: 1,
            values: currentValues,
          }),
        )
        app.save(users)
        users = app.findCollectionByNameOrId('_pb_users_auth_')
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
      users = app.findCollectionByNameOrId('_pb_users_auth_')
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
