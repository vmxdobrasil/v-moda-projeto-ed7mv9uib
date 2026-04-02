migrate(
  (app) => {
    const usersId = app.findCollectionByNameOrId('users').id
    const collection = new Collection({
      name: 'whatsapp_configs',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        { name: 'user', type: 'relation', required: true, collectionId: usersId, maxSelect: 1 },
        { name: 'api_url', type: 'url', required: true },
        { name: 'token', type: 'text', required: false },
        { name: 'instance_id', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_whatsapp_configs_user ON whatsapp_configs (user)'],
    })

    app.save(collection)

    const cust = app.findCollectionByNameOrId('customers')
    if (!cust.fields.getByName('whatsapp_welcome_sent')) {
      cust.fields.add(new BoolField({ name: 'whatsapp_welcome_sent' }))
    }
    app.save(cust)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('whatsapp_configs')
      app.delete(collection)
    } catch (e) {}

    try {
      const cust = app.findCollectionByNameOrId('customers')
      cust.fields.removeByName('whatsapp_welcome_sent')
      app.save(cust)
    } catch (e) {}
  },
)
