migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.add(new BoolField({ name: 'is_transporter' }))
    users.fields.add(new TextField({ name: 'operating_regions' }))
    users.fields.add(
      new SelectField({
        name: 'fashion_hubs',
        maxSelect: 5,
        values: ['44_goiania', 'fama_goiania', 'bras_sp', 'bom_retiro_sp', 'outros'],
      }),
    )
    app.save(users)

    const customers = app.findCollectionByNameOrId('customers')
    customers.fields.add(new TextField({ name: 'caravan_name' }))
    customers.fields.add(new TextField({ name: 'logistics_notes' }))
    app.save(customers)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('is_transporter')
    users.fields.removeByName('operating_regions')
    users.fields.removeByName('fashion_hubs')
    app.save(users)

    const customers = app.findCollectionByNameOrId('customers')
    customers.fields.removeByName('caravan_name')
    customers.fields.removeByName('logistics_notes')
    app.save(customers)
  },
)
