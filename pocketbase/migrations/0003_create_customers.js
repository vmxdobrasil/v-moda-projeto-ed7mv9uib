migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const collection = new Collection({
      name: 'customers',
      type: 'base',
      listRule: "@request.auth.id != '' && manufacturer = @request.auth.id",
      viewRule: "@request.auth.id != '' && manufacturer = @request.auth.id",
      createRule: "@request.auth.id != '' && manufacturer = @request.auth.id",
      updateRule: "@request.auth.id != '' && manufacturer = @request.auth.id",
      deleteRule: "@request.auth.id != '' && manufacturer = @request.auth.id",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['new', 'interested', 'negotiating', 'converted', 'inactive'],
          maxSelect: 1,
        },
        {
          name: 'manufacturer',
          type: 'relation',
          required: true,
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'source',
          type: 'select',
          values: ['whatsapp', 'instagram', 'email', 'manual'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_customers_manufacturer ON customers (manufacturer)',
        'CREATE INDEX idx_customers_status ON customers (status)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('customers')
    app.delete(collection)
  },
)
