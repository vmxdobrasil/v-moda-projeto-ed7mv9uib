migrate(
  (app) => {
    try {
      const record = app.findFirstRecordByData('brand_settings', 'key', 'brand_name')
      record.set('value_text', 'V MODA BRASIL')
      app.save(record)
    } catch (_) {
      // Doesn't exist, create it
      const col = app.findCollectionByNameOrId('brand_settings')
      const record = new Record(col)
      record.set('name', 'Nome da Marca')
      record.set('key', 'brand_name')
      record.set('value_text', 'V MODA BRASIL')
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('brand_settings', 'key', 'brand_name')
      record.set('value_text', 'V Moda')
      app.save(record)
    } catch (_) {}
  },
)
