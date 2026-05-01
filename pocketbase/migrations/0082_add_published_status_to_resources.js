migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('resources')
    if (!col.fields.getByName('is_published')) {
      col.fields.add(new BoolField({ name: 'is_published' }))
      app.save(col)
    }

    app.db().newQuery('UPDATE resources SET is_published = 1').execute()

    try {
      const refCol = app.findCollectionByNameOrId('referrals')
      const brandField = refCol.fields.getByName('brand')
      if (brandField && brandField.required) {
        brandField.required = false
        app.save(refCol)
      }
    } catch (e) {
      console.log('Could not update referrals collection:', e.message)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('resources')
    col.fields.removeByName('is_published')
    app.save(col)

    try {
      const refCol = app.findCollectionByNameOrId('referrals')
      const brandField = refCol.fields.getByName('brand')
      if (brandField && !brandField.required) {
        brandField.required = true
        app.save(refCol)
      }
    } catch (e) {
      console.log('Could not update referrals collection:', e.message)
    }
  },
)
