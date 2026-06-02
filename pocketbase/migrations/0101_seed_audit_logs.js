migrate(
  (app) => {
    const auditLogs = app.findCollectionByNameOrId('commission_audit_logs')

    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      if (app.countRecords('commission_audit_logs') === 0) {
        const log1 = new Record(auditLogs)
        log1.set('admin_user', admin.id)
        log1.set('target_partner', admin.id)
        log1.set('previous_rate', 1.0)
        log1.set('new_rate', 1.5)
        app.save(log1)
      }
    } catch (e) {}
  },
  (app) => {},
)
