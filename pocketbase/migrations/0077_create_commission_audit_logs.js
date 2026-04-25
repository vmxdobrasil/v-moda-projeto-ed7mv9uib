migrate(
  (app) => {
    const auditLogs = new Collection({
      name: 'commission_audit_logs',
      type: 'base',
      listRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      viewRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      createRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'admin_user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'target_partner',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'previous_rate', type: 'number', required: false },
        { name: 'new_rate', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(auditLogs)

    const referrals = app.findCollectionByNameOrId('referrals')
    if (!referrals.fields.getByName('is_paid')) {
      referrals.fields.add(new BoolField({ name: 'is_paid' }))
      app.save(referrals)
    }
  },
  (app) => {
    try {
      const auditLogs = app.findCollectionByNameOrId('commission_audit_logs')
      app.delete(auditLogs)
    } catch (_) {}

    try {
      const referrals = app.findCollectionByNameOrId('referrals')
      referrals.fields.removeByName('is_paid')
      app.save(referrals)
    } catch (_) {}
  },
)
