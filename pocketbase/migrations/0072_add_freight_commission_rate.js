migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.fields.add(new NumberField({ name: 'freight_commission_rate', min: 0, max: 100 }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.fields.removeByName('freight_commission_rate')
    app.save(col)
  },
)
