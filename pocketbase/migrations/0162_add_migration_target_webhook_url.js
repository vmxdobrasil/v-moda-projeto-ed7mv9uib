migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('brand_settings')
    let existing = null
    try {
      existing = app.findFirstRecordByData('brand_settings', 'key', 'migration_target_webhook_url')
    } catch (_) {
      existing = null
    }

    if (!existing) {
      const record = new Record(col)
      record.set('key', 'migration_target_webhook_url')
      record.set('name', 'URL Webhook de Migração V MODA 2')
      record.set('value_text', 'https://v-moda-brasil-d7c0f.goskip.app/backend/v1/n8n-webhook')
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData(
        'brand_settings',
        'key',
        'migration_target_webhook_url',
      )
      if (record) {
        app.delete(record)
      }
    } catch (_) {}
  },
)
