migrate(
  (app) => {
    let adminUser
    try {
      adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
    } catch (_) {
      return
    }

    const col = app.findCollectionByNameOrId('whatsapp_templates')

    const templates = [
      {
        name: 'Boas-vindas Padrão',
        trigger_event: 'welcome_message',
        content:
          'Olá {{name}}! Bem-vindo à elite da Revista MODA ATUAL. Você agora faz parte do nosso ecossistema de parceiros.',
        is_active: true,
      },
      {
        name: 'Promoção de Ranking',
        trigger_event: 'ranking_promotion',
        content:
          'Parabéns {{name}}! Você subiu para o ranking {{ranking}} na categoria {{category}}. Seus benefícios de 80% de desconto e acesso à Mini Esteira foram liberados!',
        is_active: true,
      },
    ]

    for (const t of templates) {
      try {
        app.findFirstRecordByFilter(
          'whatsapp_templates',
          'user = {:user} && trigger_event = {:trigger}',
          { user: adminUser.id, trigger: t.trigger_event },
        )
      } catch (_) {
        const record = new Record(col)
        record.set('user', adminUser.id)
        record.set('name', t.name)
        record.set('trigger_event', t.trigger_event)
        record.set('content', t.content)
        record.set('is_active', t.is_active)
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      const adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      const records = app.findRecordsByFilter(
        'whatsapp_templates',
        'user = {:user}',
        '-created',
        100,
        0,
        { user: adminUser.id },
      )
      for (const record of records) {
        app.delete(record)
      }
    } catch (_) {}
  },
)
