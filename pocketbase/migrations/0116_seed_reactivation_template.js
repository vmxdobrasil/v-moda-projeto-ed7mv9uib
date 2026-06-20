migrate(
  (app) => {
    const newContent =
      'Olá {{name}}! Faz tempo que não nos falamos. Temos novidades exclusivas na V MODA BRASIL que você vai amar. Posso te enviar o catálogo novo?'

    try {
      const tpl = app.findFirstRecordByFilter(
        'whatsapp_templates',
        "trigger_event = 'reactivation_campaign'",
      )
      tpl.set('content', newContent)
      app.save(tpl)
    } catch (_) {
      let adminUser
      try {
        adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      } catch (_) {
        return
      }

      const col = app.findCollectionByNameOrId('whatsapp_templates')
      const record = new Record(col)
      record.set('user', adminUser.id)
      record.set('name', 'Campanha de Reativação')
      record.set('trigger_event', 'reactivation_campaign')
      record.set('content', newContent)
      record.set('is_active', true)
      app.save(record)
    }
  },
  (app) => {
    // Safe down migration: do nothing to preserve the state before if it existed.
  },
)
