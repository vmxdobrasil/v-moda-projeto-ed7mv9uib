migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('operating_cities')) {
      users.fields.add(new TextField({ name: 'operating_cities' }))
    }
    app.save(users)

    const customers = app.findCollectionByNameOrId('customers')
    if (!customers.fields.getByName('freight_value')) {
      customers.fields.add(new NumberField({ name: 'freight_value' }))
    }
    app.save(customers)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('operating_cities')
    app.save(users)

    const customers = app.findCollectionByNameOrId('customers')
    customers.fields.removeByName('freight_value')
    app.save(customers)
  },
)
