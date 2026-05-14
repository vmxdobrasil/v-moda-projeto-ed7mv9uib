migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')

    if (!col.fields.getByName('origin_store_name')) {
      col.fields.add(new TextField({ name: 'origin_store_name' }))
    }

    col.addIndex('idx_customers_manufacturer_phone', false, 'manufacturer, phone', '')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.removeIndex('idx_customers_manufacturer_phone')
    app.save(col)
  },
)
