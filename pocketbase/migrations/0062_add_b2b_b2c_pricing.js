migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('projects')

    if (!col.fields.getByName('wholesale_price')) {
      col.fields.add(new NumberField({ name: 'wholesale_price' }))
    }
    if (!col.fields.getByName('retail_price')) {
      col.fields.add(new NumberField({ name: 'retail_price' }))
    }
    if (!col.fields.getByName('min_quantity_wholesale')) {
      col.fields.add(new NumberField({ name: 'min_quantity_wholesale' }))
    }

    col.addIndex('idx_projects_manufacturer', false, 'manufacturer', '')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('projects')
    col.fields.removeByName('wholesale_price')
    col.fields.removeByName('retail_price')
    col.fields.removeByName('min_quantity_wholesale')
    col.removeIndex('idx_projects_manufacturer')
    app.save(col)
  },
)
