migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.addIndex('idx_customers_last_contacted_at', false, 'last_contacted_at', '')
    col.addIndex('idx_customers_status_contacted', false, 'status, last_contacted_at', '')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.removeIndex('idx_customers_last_contacted_at')
    col.removeIndex('idx_customers_status_contacted')
    app.save(col)
  },
)
