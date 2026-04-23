migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Ensure the role field has "admin" in its values before saving the user
    let roleField = users.fields.getByName('role')
    if (roleField && roleField.type === 'select') {
      const currentValues = Array.from(roleField.values || [])
      if (!currentValues.includes('admin')) {
        currentValues.push('admin')
        roleField.values = currentValues
        users.fields.add(roleField)
        app.save(users)
      }
    } else if (!roleField) {
      roleField = new SelectField({
        name: 'role',
        maxSelect: 1,
        values: ['user', 'admin'],
      })
      users.fields.add(roleField)
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
