migrate(
  (app) => {
    const colNames = ['leads_venda', 'leads_fabricantes', 'leads_retailers']
    for (const name of colNames) {
      const col = app.findCollectionByNameOrId(name)
      if (!col.fields.getByName('notes')) {
        col.fields.add(new TextField({ name: 'notes' }))
      }
      if (name === 'leads_venda') {
        col.updateRule =
          "@request.auth.id != '' && (retailer = @request.auth.id || manufacturer = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com')"
      }
      app.save(col)
    }
  },
  (app) => {
    const colNames = ['leads_venda', 'leads_fabricantes', 'leads_retailers']
    for (const name of colNames) {
      const col = app.findCollectionByNameOrId(name)
      try {
        col.fields.removeByName('notes')
      } catch (_) {}
      app.save(col)
    }
  },
)
