migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.fields.add(new NumberField({ name: 'price', required: false }))
    col.fields.add(new NumberField({ name: 'stock_quantity', required: false }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.fields.removeByName('price')
    col.fields.removeByName('stock_quantity')
    app.save(col)
  },
)
