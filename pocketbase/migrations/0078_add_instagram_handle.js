migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.fields.add(new TextField({ name: 'instagram_handle' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.fields.removeByName('instagram_handle')
    app.save(col)
  },
)
