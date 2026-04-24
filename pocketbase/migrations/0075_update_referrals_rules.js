migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('referrals')
    col.listRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com' || affiliate = @request.auth.id || brand.manufacturer = @request.auth.id)"
    col.viewRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com' || affiliate = @request.auth.id || brand.manufacturer = @request.auth.id)"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('referrals')
    col.listRule = "@request.auth.id != '' && affiliate = @request.auth.id"
    col.viewRule = "@request.auth.id != '' && affiliate = @request.auth.id"
    app.save(col)
  },
)
