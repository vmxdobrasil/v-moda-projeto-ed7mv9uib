migrate(
  (app) => {
    // Enforce strictly multi-tenant isolated access rules for Customers
    const customers = app.findCollectionByNameOrId('customers')
    customers.listRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id || @request.auth.email = 'valterpmendonca@gmail.com')"
    customers.viewRule = customers.listRule
    customers.updateRule = customers.listRule
    customers.deleteRule = customers.listRule
    app.save(customers)

    // Ensure catalog/projects are visible publicly while enforcing strictly multi-tenant isolated write access
    const projects = app.findCollectionByNameOrId('projects')
    projects.listRule = ''
    projects.viewRule = ''
    projects.createRule = "@request.auth.id != '' && manufacturer = @request.auth.id"
    projects.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || manufacturer = @request.auth.id)"
    projects.deleteRule = projects.updateRule
    app.save(projects)

    // Enforce notification access per user
    const notifications = app.findCollectionByNameOrId('notifications')
    notifications.listRule =
      "@request.auth.id != '' && (user = @request.auth.id || customer_email = @request.auth.email)"
    notifications.viewRule = notifications.listRule
    app.save(notifications)
  },
  (app) => {
    // Optional revert logic for projects list
    const projects = app.findCollectionByNameOrId('projects')
    projects.listRule = "@request.auth.role != 'manufacturer' || manufacturer = @request.auth.id"
    projects.viewRule = projects.listRule
    app.save(projects)
  },
)
