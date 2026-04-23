migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

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
      }
    } else if (!roleField) {
      users.fields.add(
        new SelectField({
          name: 'role',
          maxSelect: 1,
          values: ['user', 'admin'],
        }),
      )
    }

    const adminRule = "@request.auth.role = 'admin'"
    const appendRule = (rule) => {
      if (!rule) return adminRule
      if (!rule.includes(adminRule)) {
        return rule + ' || ' + adminRule
      }
      return rule
    }

    users.listRule = appendRule(users.listRule)
    users.viewRule = appendRule(users.viewRule)
    users.updateRule = appendRule(users.updateRule)
    users.deleteRule = appendRule(users.deleteRule)

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const roleField = users.fields.getByName('role')
    if (roleField && roleField.type === 'select') {
      const newValues = Array.from(roleField.values || []).filter((v) => v !== 'admin')
      users.fields.add(
        new SelectField({
          name: 'role',
          maxSelect: 1,
          values: newValues.length > 0 ? newValues : ['user'],
        }),
      )
    }

    app.save(users)
  },
)
