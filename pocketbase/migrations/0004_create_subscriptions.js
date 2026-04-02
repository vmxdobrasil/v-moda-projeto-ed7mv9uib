migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const collection = new Collection({
      name: 'subscriptions',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: null,
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'plan_tier',
          type: 'select',
          values: ['free', 'basic', 'pro', 'enterprise'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['active', 'past_due', 'canceled'],
          maxSelect: 1,
        },
        { name: 'next_billing_date', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_subscriptions_user ON subscriptions (user)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('subscriptions')
    app.delete(collection)
  },
)
