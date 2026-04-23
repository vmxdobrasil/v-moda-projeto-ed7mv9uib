migrate(
  (app) => {
    const projects = app.findCollectionByNameOrId('projects')
    projects.listRule =
      "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com' || manufacturer = @request.auth.id"
    projects.viewRule =
      "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com' || manufacturer = @request.auth.id"
    app.save(projects)

    const customers = app.findCollectionByNameOrId('customers')
    customers.listRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com' || manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id)"
    customers.viewRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com' || manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id)"
    app.save(customers)
  },
  (app) => {
    const projects = app.findCollectionByNameOrId('projects')
    projects.listRule = ''
    projects.viewRule = ''
    app.save(projects)

    const customers = app.findCollectionByNameOrId('customers')
    customers.listRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id || @request.auth.email = 'valterpmendonca@gmail.com')"
    customers.viewRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id || @request.auth.email = 'valterpmendonca@gmail.com')"
    app.save(customers)
  },
)
