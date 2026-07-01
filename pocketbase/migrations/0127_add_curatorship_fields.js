migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!users.fields.getByName('wallet_id')) {
      users.fields.add(new TextField({ name: 'wallet_id' }))
    }
    if (!users.fields.getByName('is_waitlisted')) {
      users.fields.add(new BoolField({ name: 'is_waitlisted' }))
    }
    if (!users.fields.getByName('brand_name')) {
      users.fields.add(new TextField({ name: 'brand_name' }))
    }
    app.save(users)

    const categories = app.findCollectionByNameOrId('categories')
    if (!categories.fields.getByName('ranking_limit')) {
      categories.fields.add(new NumberField({ name: 'ranking_limit' }))
    }
    app.save(categories)

    try {
      app.findFirstRecordByData('brand_settings', 'key', 'global_top_limit')
    } catch (_) {
      const bsCol = app.findCollectionByNameOrId('brand_settings')
      const record = new Record(bsCol)
      record.set('name', 'Limite Global do TOP')
      record.set('key', 'global_top_limit')
      record.set('value_text', '60')
      app.save(record)
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      users.fields.removeByName('wallet_id')
    } catch (_) {}
    try {
      users.fields.removeByName('is_waitlisted')
    } catch (_) {}
    try {
      users.fields.removeByName('brand_name')
    } catch (_) {}
    app.save(users)

    const categories = app.findCollectionByNameOrId('categories')
    try {
      categories.fields.removeByName('ranking_limit')
    } catch (_) {}
    app.save(categories)

    try {
      const record = app.findFirstRecordByData('brand_settings', 'key', 'global_top_limit')
      app.delete(record)
    } catch (_) {}
  },
)
