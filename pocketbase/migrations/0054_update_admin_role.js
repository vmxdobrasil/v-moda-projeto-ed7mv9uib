migrate(
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')
      user.set('role', 'manufacturer')
      app.save(user)

      try {
        const sub = app.findFirstRecordByData('subscriptions', 'user', user.id)
        sub.set('plan_tier', 'enterprise')
        sub.set('import_limit', 999999)
        app.save(sub)
      } catch (_) {
        const subCol = app.findCollectionByNameOrId('subscriptions')
        const sub = new Record(subCol)
        sub.set('user', user.id)
        sub.set('plan_tier', 'enterprise')
        sub.set('status', 'active')
        sub.set('import_limit', 999999)
        app.save(sub)
      }
    } catch (_) {
      // User doesn't exist yet, ignore
    }
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')
      user.set('role', '')
      app.save(user)

      const sub = app.findFirstRecordByData('subscriptions', 'user', user.id)
      sub.set('plan_tier', 'free')
      sub.set('import_limit', 50)
      app.save(sub)
    } catch (_) {}
  },
)
