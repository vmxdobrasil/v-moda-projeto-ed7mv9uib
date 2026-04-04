migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    const sourceField = col.fields.getByName('source')
    if (sourceField && !sourceField.values.includes('site')) {
      sourceField.values.push('site')
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    const sourceField = col.fields.getByName('source')
    if (sourceField) {
      sourceField.values = sourceField.values.filter((v) => v !== 'site')
    }
    app.save(col)
  },
)
