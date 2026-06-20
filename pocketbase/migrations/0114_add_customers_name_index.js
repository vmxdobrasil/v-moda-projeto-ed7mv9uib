/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')

    // Ensure the requested fields are indexed for high-performance filtering.
    // addIndex is idempotent, so it is safe even if some already exist.
    col.addIndex('idx_customers_name', false, 'name', '')
    col.addIndex('idx_customers_status', false, 'status', '')
    col.addIndex('idx_customers_phone', false, 'phone', '')
    col.addIndex('idx_customers_shipping_method', false, 'shipping_method', '')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.removeIndex('idx_customers_name')
    col.removeIndex('idx_customers_shipping_method')
    app.save(col)
  },
)
