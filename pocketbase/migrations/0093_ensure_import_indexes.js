migrate(
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    customers.addIndex('idx_customers_phone_lookup', false, 'phone', '')
    try {
      app.save(customers)
    } catch (err) {
      if (String(err).includes('already exists')) {
        console.log('Index on customers phone already exists, skipping')
      } else {
        throw err
      }
    }

    const importLogs = app.findCollectionByNameOrId('import_logs')
    importLogs.addIndex('idx_import_logs_user_lookup', false, 'user', '')
    try {
      app.save(importLogs)
    } catch (err) {
      if (String(err).includes('already exists')) {
        console.log('Index on import_logs user already exists, skipping')
      } else {
        throw err
      }
    }
  },
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    customers.removeIndex('idx_customers_phone_lookup')
    try {
      app.save(customers)
    } catch (_) {}

    const importLogs = app.findCollectionByNameOrId('import_logs')
    importLogs.removeIndex('idx_import_logs_user_lookup')
    try {
      app.save(importLogs)
    } catch (_) {}
  },
)
