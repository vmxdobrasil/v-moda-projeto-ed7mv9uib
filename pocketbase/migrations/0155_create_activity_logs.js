migrate(
  (app) => {
    const activityLogs = new Collection({
      name: 'activity_logs',
      type: 'base',
      listRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      viewRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: false,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'action_type', type: 'text', required: true },
        { name: 'description', type: 'text', required: false },
        { name: 'metadata', type: 'json', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_activity_logs_user ON activity_logs (user)',
        'CREATE INDEX idx_activity_logs_action_type ON activity_logs (action_type)',
        'CREATE INDEX idx_activity_logs_created ON activity_logs (created DESC)',
      ],
    })
    app.save(activityLogs)

    const users = app.findCollectionByNameOrId('users')
    users.listRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'"
    users.viewRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'"
    users.updateRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'"
    users.deleteRule =
      "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'"
    app.save(users)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('activity_logs')
      app.delete(col)
    } catch (_) {}

    const users = app.findCollectionByNameOrId('users')
    users.listRule = "id = @request.auth.id || @request.auth.email = 'valterpmendonca@gmail.com'"
    users.viewRule = users.listRule
    users.updateRule = users.listRule
    users.deleteRule = users.listRule
    app.save(users)
  },
)
