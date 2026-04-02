migrate(
  (app) => {
    const collection = new Collection({
      name: 'notifications',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (user = @request.auth.id || customer_email = @request.auth.email)",
      viewRule:
        "@request.auth.id != '' && (user = @request.auth.id || customer_email = @request.auth.email)",
      createRule: null,
      updateRule:
        "@request.auth.id != '' && (user = @request.auth.id || customer_email = @request.auth.email)",
      deleteRule: null,
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: false,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'customer_email', type: 'email', required: false },
        { name: 'title', type: 'text', required: true },
        { name: 'message', type: 'text', required: true },
        { name: 'read', type: 'bool', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notifications_user ON notifications (user)',
        'CREATE INDEX idx_notifications_email ON notifications (customer_email)',
        'CREATE INDEX idx_notifications_created ON notifications (created DESC)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('notifications')
    app.delete(collection)
  },
)
