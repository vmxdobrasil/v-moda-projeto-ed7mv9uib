migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const roleField = users.fields.getByName('role')

    let vals = ['user', 'admin']
    let isRequired = false
    let maxSel = 1

    if (roleField) {
      if (roleField.type === 'select') {
        maxSel = roleField.maxSelect || 1
        const existing = roleField.values || []
        vals = []
        for (let i = 0; i < existing.length; i++) {
          vals.push(existing[i])
        }
        if (!vals.includes('admin')) {
          vals.push('admin')
        }
        isRequired = roleField.required || false

        users.fields.add(
          new SelectField({
            name: 'role',
            maxSelect: maxSel,
            values: vals,
            required: isRequired,
          }),
        )
        app.save(users)
      }
    } else {
      users.fields.add(
        new SelectField({
          name: 'role',
          maxSelect: 1,
          values: vals,
          required: false,
        }),
      )
      app.save(users)
    }

    const email = 'valterpmendonca@gmail.com'
    const valToSet = maxSel > 1 ? ['admin'] : 'admin'

    let record
    let isNew = false
    try {
      record = app.findAuthRecordByEmail('_pb_users_auth_', email)
    } catch (_) {
      const usersUpdated = app.findCollectionByNameOrId('_pb_users_auth_')
      record = new Record(usersUpdated)
      record.setEmail(email)
      record.setPassword('Skip@Pass')
      isNew = true
    }

    record.setVerified(true)
    record.set('role', valToSet)
    if (isNew) {
      record.set('name', 'Admin Valter')
    }

    try {
      // Attempting to save without validation bypasses transaction schema caching issues
      if (typeof app.saveNoValidate === 'function') {
        app.saveNoValidate(record)
      } else {
        app.save(record)
      }
    } catch (err) {
      // If validation fails (due to schema cache out-of-sync inside transaction) fallback to raw SQL
      if (!isNew) {
        app
          .db()
          .newQuery(
            'UPDATE _pb_users_auth_ SET role = {:role}, verified = 1 WHERE email = {:email}',
          )
          .bind({ role: maxSel > 1 ? JSON.stringify(valToSet) : valToSet, email: email })
          .execute()
      } else {
        throw err
      }
    }
  },
  (app) => {
    // Safe to leave
  },
)
