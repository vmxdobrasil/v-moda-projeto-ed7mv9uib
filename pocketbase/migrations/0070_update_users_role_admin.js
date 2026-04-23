migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const roleField = users.fields.getByName('role')
    if (roleField && roleField.type === 'select') {
      const currentValues = roleField.values || []
      if (!currentValues.includes('admin')) {
        currentValues.push('admin')
        roleField.values = currentValues
      }
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
      roleField.values = (roleField.values || []).filter((v) => v !== 'admin')
    }

    app.save(users)
  },
)
