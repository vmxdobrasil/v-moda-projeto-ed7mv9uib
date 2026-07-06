migrate(
  (app) => {
    let adminId = ''
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      adminId = admin.id
    } catch (_) {}

    const activityLogs = app.findCollectionByNameOrId('activity_logs')
    if (app.countRecords('activity_logs') === 0) {
      const samples = [
        {
          action_type: 'user_role_updated',
          description: 'Role do usuario alterado para manufacturer',
        },
        { action_type: 'user_deleted', description: 'Usuario de teste removido da plataforma' },
        { action_type: 'lead_updated', description: 'Status do lead alterado para converted' },
        {
          action_type: 'data_import',
          description: 'Importacao de 150 clientes concluida com sucesso',
        },
      ]
      for (const s of samples) {
        const record = new Record(activityLogs)
        if (adminId) record.set('user', adminId)
        record.set('action_type', s.action_type)
        record.set('description', s.description)
        record.set('metadata', JSON.stringify({}))
        app.save(record)
      }
    }

    const notifications = app.findCollectionByNameOrId('notifications')
    if (app.countRecords('notifications') === 0) {
      const notifSamples = [
        {
          title: 'Meta de Vendas Alcançada!',
          message: 'Parabéns! A meta de vendas mensal foi atingida.',
        },
        {
          title: 'Novo Fabricante Cadastrado',
          message: 'Um novo fabricante foi aprovado no Guia de Marcas.',
        },
        { title: 'Sistema Atualizado', message: 'Nova versão do painel CRM está disponível.' },
      ]
      for (const n of notifSamples) {
        const record = new Record(notifications)
        record.set('title', n.title)
        record.set('message', n.message)
        record.set('read', false)
        if (adminId) record.set('user', adminId)
        app.save(record)
      }
    }
  },
  (app) => {},
)
