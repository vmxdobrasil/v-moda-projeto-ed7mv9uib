migrate(
  (app) => {
    // 1. Atualizar enum do campo 'source' em customers para incluir 'maestro' e 'maestro_adapta'
    const customersCol = app.findCollectionByNameOrId('customers')
    const sourceField = customersCol.fields.getByName('source')
    if (sourceField) {
      const values = sourceField.values || []
      if (!values.includes('maestro')) values.push('maestro')
      if (!values.includes('maestro_adapta')) values.push('maestro_adapta')
      sourceField.values = values
      app.save(customersCol)
    }

    // 2. Criar coleção integration_state para persistência de passos
    if (!app.hasTable('integration_state')) {
      const stateCol = new Collection({
        name: 'integration_state',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'step', type: 'text', required: true },
          { name: 'done_at', type: 'date', required: false },
          { name: 'integration', type: 'text', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_integration_state_step ON integration_state (integration, step)',
        ],
      })
      app.save(stateCol)
    }

    // 3. Criar ou garantir usuário de serviço svc-maestro@integracao.local
    const usersCol = app.findCollectionByNameOrId('users')
    let svcUser = null
    try {
      svcUser = app.findAuthRecordByEmail('users', 'svc-maestro@integracao.local')
    } catch (_) {
      // não existe, cria novo
    }

    if (!svcUser) {
      svcUser = new Record(usersCol)
      svcUser.setEmail('svc-maestro@integracao.local')
      svcUser.setPassword('MstServiceSecuredToken2026!')
      svcUser.setVerified(true)
      svcUser.set('name', 'Serviço Maestro Adapta')
      svcUser.set('role', 'admin') // permissão para leitura e contagens
      app.save(svcUser)
    }

    // 4. Inicializar token padrão do Maestro em brand_settings caso ainda não exista
    try {
      app.findFirstRecordByData('brand_settings', 'key', 'maestro_integration_token')
    } catch (_) {
      const bsCol = app.findCollectionByNameOrId('brand_settings')
      const tokenRec = new Record(bsCol)
      tokenRec.set('name', 'Token de Integração Maestro (Adapta)')
      tokenRec.set('key', 'maestro_integration_token')
      tokenRec.set('value_text', 'mst_live_9f82d1c5a74e2b090e8d7f3a1b6c8e02')
      app.save(tokenRec)
    }

    // Status do token (active | revoked)
    try {
      app.findFirstRecordByData('brand_settings', 'key', 'maestro_token_status')
    } catch (_) {
      const bsCol = app.findCollectionByNameOrId('brand_settings')
      const statusRec = new Record(bsCol)
      statusRec.set('name', 'Status do Token Maestro')
      statusRec.set('key', 'maestro_token_status')
      statusRec.set('value_text', 'active')
      app.save(statusRec)
    }

    // 5. Excluir o lead de teste registrado (phone +5511999990000, nome "Lead WhatsApp 0000")
    try {
      const testLeads = app.findRecordsByFilter(
        'customers',
        "phone = '5511999990000' && name ~ 'Lead WhatsApp 0000'",
        '',
        10,
        0,
      )
      for (let i = 0; i < testLeads.length; i++) {
        app.delete(testLeads[i])
      }
    } catch (_) {}
  },
  (app) => {
    // Reverter coleções/usuários se necessário
    try {
      const svcUser = app.findAuthRecordByEmail('users', 'svc-maestro@integracao.local')
      app.delete(svcUser)
    } catch (_) {}

    try {
      const stateCol = app.findCollectionByNameOrId('integration_state')
      app.delete(stateCol)
    } catch (_) {}
  },
)
