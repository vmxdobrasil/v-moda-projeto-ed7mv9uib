migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const roleField = users.fields.getByName('role')

    let vals = ['user', 'admin']
    let isRequired = false

    if (roleField && roleField.type === 'select') {
      const existing = roleField.values || []
      vals = []
      for (let i = 0; i < existing.length; i++) {
        vals.push(existing[i])
      }
      if (!vals.includes('admin')) {
        vals.push('admin')
      }
      isRequired = roleField.required || false
    }

    users.fields.add(
      new SelectField({
        name: 'role',
        maxSelect: 1,
        values: vals,
        required: isRequired,
      }),
    )

    app.save(users)

    const email = 'valterpmendonca@gmail.com'
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', email)
      record.set('role', 'admin')
      record.setVerified(true)
      app.save(record)
    } catch (_) {
      const usersUpdated = app.findCollectionByNameOrId('_pb_users_auth_')
      const record = new Record(usersUpdated)
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
