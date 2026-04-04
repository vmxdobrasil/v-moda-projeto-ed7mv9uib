migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.fields.add(new BoolField({ name: 'is_verified' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    const field = col.fields.getByName('is_verified')
    if (field) {
      col.fields.removeById(field.id)
      app.save(col)
    }
  },
)
