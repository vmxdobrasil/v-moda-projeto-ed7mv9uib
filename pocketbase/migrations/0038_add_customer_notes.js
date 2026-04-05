migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    if (!col.fields.getByName('notes')) {
      col.fields.add(new TextField({ name: 'notes' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.fields.removeByName('notes')
    app.save(col)
  },
)
