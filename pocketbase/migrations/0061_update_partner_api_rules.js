migrate(
  (app) => {
    const projects = app.findCollectionByNameOrId('projects')
    projects.listRule = "@request.auth.role != 'manufacturer' || manufacturer = @request.auth.id"
    projects.viewRule = "@request.auth.role != 'manufacturer' || manufacturer = @request.auth.id"
    projects.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || manufacturer = @request.auth.id)"
    projects.deleteRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || manufacturer = @request.auth.id)"
    app.save(projects)

    const customers = app.findCollectionByNameOrId('customers')
    const rule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id || @request.auth.email = 'valterpmendonca@gmail.com')"
    customers.listRule = rule
    customers.viewRule = rule
    customers.updateRule = rule
    customers.deleteRule = rule
    app.save(customers)
  },
  (app) => {
    const projects = app.findCollectionByNameOrId('projects')
    projects.listRule = ''
    projects.viewRule = ''
    projects.updateRule = "@request.auth.id != '' && manufacturer = @request.auth.id"
    projects.deleteRule = "@request.auth.id != '' && manufacturer = @request.auth.id"
    app.save(projects)

    const customers = app.findCollectionByNameOrId('customers')
    const rule =
      "@request.auth.id != '' && (manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id || @request.auth.email = 'valterpmendonca@gmail.com')"
    customers.listRule = rule
    customers.viewRule = rule
    customers.updateRule = rule
    customers.deleteRule = rule
    app.save(customers)
  },
)
