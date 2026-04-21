migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('brand_settings')

    try {
      app.findFirstRecordByData('brand_settings', 'key', 'brand_logo')
    } catch (_) {
      const record = new Record(col)
      record.set('name', 'Logotipo Principal')
      record.set('key', 'brand_logo')
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('brand_settings', 'key', 'brand_logo')
      app.delete(record)
    } catch (_) {}
  },
)
