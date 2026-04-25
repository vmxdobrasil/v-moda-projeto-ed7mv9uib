migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const roleField = users.fields.getByName('role')

    if (roleField) {
      roleField.values = ['manufacturer', 'retailer', 'affiliate', 'agent']
      app.save(users)
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const roleField = users.fields.getByName('role')

    if (roleField) {
      roleField.values = ['manufacturer', 'retailer', 'affiliate']
      app.save(users)
    }
  },
)
