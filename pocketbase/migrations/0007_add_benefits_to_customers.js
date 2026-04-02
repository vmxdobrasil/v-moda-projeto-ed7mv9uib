migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    if (!col.fields.getByName('unlocked_benefits')) {
      col.fields.add(new JSONField({ name: 'unlocked_benefits' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    if (col.fields.getByName('unlocked_benefits')) {
      col.fields.removeByName('unlocked_benefits')
      app.save(col)
    }
  },
)
