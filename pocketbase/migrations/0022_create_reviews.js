migrate(
  (app) => {
    const reviews = new Collection({
      name: 'reviews',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'brand',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('customers').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
        { name: 'comment', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_reviews_brand ON reviews (brand)',
        'CREATE INDEX idx_reviews_user ON reviews (user)',
        'CREATE UNIQUE INDEX idx_reviews_user_brand ON reviews (user, brand)',
      ],
    })
    app.save(reviews)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('reviews')
    app.delete(col)
  },
)
