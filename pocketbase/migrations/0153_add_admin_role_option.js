migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    const roleField = users.fields.getByName('role')
    if (!roleField) return

    const desiredValues = ['admin', 'manufacturer', 'retailer', 'affiliate', 'agent', 'fashionista']

    const currentValues = roleField.values || []
    const hasAll = desiredValues.every((v) => currentValues.includes(v))

    if (!hasAll || currentValues[0] !== 'admin') {
      roleField.values = desiredValues
    }

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const roleField = users.fields.getByName('role')
    if (roleField) {
      roleField.values = ['manufacturer', 'retailer', 'affiliate', 'agent', 'fashionista']
      app.save(users)
    }
  },
)
