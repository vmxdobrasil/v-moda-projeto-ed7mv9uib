migrate(
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    customers.addIndex('idx_customers_phone_lookup', false, 'phone', '')
    app.save(customers)

    const importLogs = app.findCollectionByNameOrId('import_logs')
    importLogs.addIndex('idx_import_logs_user_lookup', false, 'user', '')
    app.save(importLogs)
  },
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    customers.removeIndex('idx_customers_phone_lookup')
    app.save(customers)

    const importLogs = app.findCollectionByNameOrId('import_logs')
    importLogs.removeIndex('idx_import_logs_user_lookup')
    app.save(importLogs)
  },
)
