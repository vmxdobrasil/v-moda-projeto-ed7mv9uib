migrate(
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const collection = new Collection({
      name: 'favorites',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
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
          name: 'brand',
          type: 'relation',
          required: true,
          collectionId: customers.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_favorites_user_brand ON favorites (user, brand)'],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('favorites')
    app.delete(collection)
  },
)
