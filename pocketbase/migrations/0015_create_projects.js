migrate(
  (app) => {
    const collection = new Collection({
      name: 'projects',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != '' && manufacturer = @request.auth.id",
      updateRule: "@request.auth.id != '' && manufacturer = @request.auth.id",
      deleteRule: "@request.auth.id != '' && manufacturer = @request.auth.id",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'image',
          type: 'file',
          required: true,
          maxSelect: 1,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        {
          name: 'manufacturer',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('_pb_users_auth_').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'category',
          type: 'select',
          required: false,
          values: [
            'moda_feminina',
            'jeans',
            'moda_praia',
            'moda_geral',
            'moda_masculina',
            'moda_evangelica',
            'moda_country',
            'moda_infantil',
            'bijouterias_semijoias',
            'calcados',
          ],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('projects')
    app.delete(collection)
  },
)
