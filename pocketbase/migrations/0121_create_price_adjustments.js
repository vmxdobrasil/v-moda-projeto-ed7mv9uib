migrate(
  (app) => {
    const collection = new Collection({
      name: 'price_adjustments',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != '' && merchant = @request.auth.id",
      updateRule: "@request.auth.id != '' && merchant = @request.auth.id",
      deleteRule: "@request.auth.id != '' && merchant = @request.auth.id",
      fields: [
        {
          name: 'merchant',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'project',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('projects').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'customer',
          type: 'relation',
          required: false,
          collectionId: app.findCollectionByNameOrId('customers').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'is_zone_wide', type: 'bool', required: false },
        { name: 'adjusted_price', type: 'number', required: true, min: 0 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_price_adj_merchant ON price_adjustments (merchant)',
        'CREATE INDEX idx_price_adj_project ON price_adjustments (project)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('price_adjustments')
    app.delete(collection)
  },
)
