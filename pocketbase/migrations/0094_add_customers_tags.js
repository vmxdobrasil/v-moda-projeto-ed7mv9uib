migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    if (!col.fields.getByName('tags')) {
      col.fields.add(new JSONField({ name: 'tags', required: false }))
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    if (col.fields.getByName('tags')) {
      col.fields.removeByName('tags')
      app.save(col)
    }
  },
)
