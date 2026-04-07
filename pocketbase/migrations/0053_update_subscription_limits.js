migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('subscriptions')

    if (!col.fields.getByName('import_limit')) {
      col.fields.add(new NumberField({ name: 'import_limit' }))
      app.save(col)
    }

    app
      .db()
      .newQuery(
        "UPDATE subscriptions SET import_limit = 50 WHERE plan_tier = 'free' OR plan_tier IS NULL OR plan_tier = ''",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE subscriptions SET import_limit = 10000 WHERE plan_tier != 'free' AND plan_tier IS NOT NULL AND plan_tier != ''",
      )
      .execute()

    try {
      const user = app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')
      let sub
      try {
        sub = app.findFirstRecordByData('subscriptions', 'user', user.id)
      } catch (_) {
        sub = new Record(col)
        sub.set('user', user.id)
      }
      sub.set('plan_tier', 'free')
      sub.set('status', 'active')
      sub.set('import_limit', 50)
      app.save(sub)
    } catch (_) {
      // ignore if seed user missing
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('subscriptions')
    if (col.fields.getByName('import_limit')) {
      col.fields.removeByName('import_limit')
      app.save(col)
    }
  },
)
