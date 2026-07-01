migrate(
  (app) => {
    const collection = new Collection({
      name: 'leads_retailers',
      type: 'base',
      listRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      viewRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      createRule: '',
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        { name: 'store_name', type: 'text', required: true },
        { name: 'contact_name', type: 'text', required: true },
        { name: 'cnpj', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'email', type: 'email', required: false },
        { name: 'city', type: 'text', required: true },
        { name: 'state', type: 'text', required: true },
        {
          name: 'fashion_hub',
          type: 'select',
          required: false,
          values: ['44_goiania', 'fama_goiania', 'bras_sp', 'bom_retiro_sp', 'outros'],
          maxSelect: 1,
        },
        { name: 'utm_source', type: 'text', required: false },
        { name: 'utm_medium', type: 'text', required: false },
        { name: 'utm_campaign', type: 'text', required: false },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'contacted', 'approved', 'rejected'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_leads_retailers_status ON leads_retailers (status)',
        'CREATE INDEX idx_leads_retailers_state ON leads_retailers (state)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('leads_retailers'))
    } catch (_) {}
  },
)
