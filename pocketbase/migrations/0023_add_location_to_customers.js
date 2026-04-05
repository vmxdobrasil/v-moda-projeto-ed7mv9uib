migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    if (!col.fields.getByName('city')) col.fields.add(new TextField({ name: 'city' }))
    if (!col.fields.getByName('state')) col.fields.add(new TextField({ name: 'state' }))
    if (!col.fields.getByName('rating_average'))
      col.fields.add(new NumberField({ name: 'rating_average' }))
    if (!col.fields.getByName('rating_count'))
      col.fields.add(new NumberField({ name: 'rating_count', onlyInt: true }))
    col.addIndex('idx_customers_city', false, 'city', '')
    col.addIndex('idx_customers_state', false, 'state', '')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.fields.removeByName('city')
    col.fields.removeByName('state')
    col.fields.removeByName('rating_average')
    col.fields.removeByName('rating_count')
    col.removeIndex('idx_customers_city')
    col.removeIndex('idx_customers_state')
    app.save(col)
  },
)
