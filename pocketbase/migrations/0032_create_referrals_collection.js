migrate(
  (app) => {
    const usersId = app.findCollectionByNameOrId('users').id
    const customersId = app.findCollectionByNameOrId('customers').id

    const collection = new Collection({
      name: 'referrals',
      type: 'base',
      listRule: "@request.auth.id != '' && affiliate = @request.auth.id",
      viewRule: "@request.auth.id != '' && affiliate = @request.auth.id",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'affiliate',
          type: 'relation',
          required: true,
          collectionId: usersId,
          maxSelect: 1,
        },
        {
          name: 'brand',
          type: 'relation',
          required: true,
          collectionId: customersId,
          maxSelect: 1,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['click', 'lead', 'conversion'],
          maxSelect: 1,
        },
        { name: 'metadata', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_referrals_affiliate ON referrals (affiliate)',
        'CREATE INDEX idx_referrals_brand ON referrals (brand)',
        'CREATE INDEX idx_referrals_type ON referrals (type)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('referrals')
    app.delete(collection)
  },
)
