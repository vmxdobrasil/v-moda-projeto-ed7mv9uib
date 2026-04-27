migrate(
  (app) => {
    const collection = new Collection({
      name: 'message_templates',
      type: 'base',
      listRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      viewRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      createRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'content', type: 'text', required: true },
        {
          name: 'channel_type',
          type: 'select',
          required: true,
          values: ['email', 'whatsapp', 'instagram'],
          maxSelect: 1,
        },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: ['initial_pitch', 'follow_up', 'partnership_details', 'closure'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('message_templates')
    app.delete(collection)
  },
)
