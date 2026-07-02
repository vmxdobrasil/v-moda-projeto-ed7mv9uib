migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')

    if (!col.fields.getByName('instagram_handle')) {
      col.fields.add(new TextField({ name: 'instagram_handle' }))
    }
    if (!col.fields.getByName('social_links')) {
      col.fields.add(new JSONField({ name: 'social_links' }))
    }
    if (!col.fields.getByName('niche')) {
      col.fields.add(new TextField({ name: 'niche' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.fields.removeByName('instagram_handle')
    col.fields.removeByName('social_links')
    col.fields.removeByName('niche')
    app.save(col)
  },
)
