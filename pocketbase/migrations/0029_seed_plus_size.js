migrate(
  (app) => {
    try {
      app.findFirstRecordByData('categories', 'slug', 'plus-size')
    } catch (_) {
      const col = app.findCollectionByNameOrId('categories')
      const record = new Record(col)
      record.set('name', 'Plus Size')
      record.set('slug', 'plus-size')
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('categories', 'slug', 'plus-size')
      app.delete(record)
    } catch (_) {}
  },
)
