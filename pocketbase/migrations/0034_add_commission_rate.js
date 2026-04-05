migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    if (!col.fields.getByName('commission_rate')) {
      col.fields.add(new NumberField({ name: 'commission_rate', min: 0.5, max: 2.0 }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.fields.removeByName('commission_rate')
    app.save(col)
  },
)
