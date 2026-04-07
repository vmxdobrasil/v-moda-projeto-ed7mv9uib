migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.listRule = "id = @request.auth.id || @request.auth.email = 'valterpmendonca@gmail.com'"
    users.viewRule = "id = @request.auth.id || @request.auth.email = 'valterpmendonca@gmail.com'"
    users.updateRule = "id = @request.auth.id || @request.auth.email = 'valterpmendonca@gmail.com'"
    users.deleteRule = "id = @request.auth.id || @request.auth.email = 'valterpmendonca@gmail.com'"
    app.save(users)

    const customers = app.findCollectionByNameOrId('customers')
    customers.listRule =
      "@request.auth.id != '' && (manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id || @request.auth.email = 'valterpmendonca@gmail.com')"
    customers.viewRule =
      "@request.auth.id != '' && (manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id || @request.auth.email = 'valterpmendonca@gmail.com')"
    customers.updateRule =
      "@request.auth.id != '' && (manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id || @request.auth.email = 'valterpmendonca@gmail.com')"
    customers.deleteRule =
      "@request.auth.id != '' && (manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id || @request.auth.email = 'valterpmendonca@gmail.com')"
    app.save(customers)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'
    app.save(users)

    const customers = app.findCollectionByNameOrId('customers')
    customers.listRule =
      "@request.auth.id != '' && (manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id)"
    customers.viewRule =
      "@request.auth.id != '' && (manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id)"
    customers.updateRule =
      "@request.auth.id != '' && (manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id)"
    customers.deleteRule =
      "@request.auth.id != '' && (manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id)"
    app.save(customers)
  },
)
