migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    if (!col.fields.getByName('active_route')) {
      col.fields.add(new TextField({ name: 'active_route' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.fields.removeByName('active_route')
    app.save(col)
  },
)
