migrate(
  (app) => {
    const notifications = app.findCollectionByNameOrId('notifications')
    notifications.listRule =
      "@request.auth.id != '' && (user = @request.auth.id || customer_email = @request.auth.email || (@request.auth.role = 'admin' && user = ''))"
    notifications.viewRule = notifications.listRule
    notifications.updateRule =
      "@request.auth.id != '' && (user = @request.auth.id || customer_email = @request.auth.email || (@request.auth.role = 'admin' && user = ''))"
    app.save(notifications)
  },
  (app) => {
    const notifications = app.findCollectionByNameOrId('notifications')
    notifications.listRule =
      "@request.auth.id != '' && (user = @request.auth.id || customer_email = @request.auth.email)"
    notifications.viewRule = notifications.listRule
    notifications.updateRule = notifications.listRule
    app.save(notifications)
  },
)
