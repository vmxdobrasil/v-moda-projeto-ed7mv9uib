migrate(
  (app) => {
    const usersId = '_pb_users_auth_'
    const customersId = app.findCollectionByNameOrId('customers').id

    const collection = new Collection({
      name: 'excursoes',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com' || agent = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com' || agent = @request.auth.id)",
      createRule: "@request.auth.id != '' && agent = @request.auth.id",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com' || agent = @request.auth.id)",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com' || agent = @request.auth.id)",
      fields: [
        { name: 'agent', type: 'relation', required: true, collectionId: usersId, maxSelect: 1 },
        { name: 'title', type: 'text', required: true },
        { name: 'departure_date', type: 'date', required: true },
        { name: 'return_date', type: 'date', required: false },
        { name: 'origin_city', type: 'text', required: true },
        { name: 'destination_city', type: 'text', required: true },
        {
          name: 'origin_hub',
          type: 'select',
          required: false,
          values: ['44_goiania', 'fama_goiania', 'bras_sp', 'bom_retiro_sp', 'outros'],
          maxSelect: 1,
        },
        {
          name: 'destination_hub',
          type: 'select',
          required: false,
          values: ['44_goiania', 'fama_goiania', 'bras_sp', 'bom_retiro_sp', 'outros'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['scheduled', 'in_progress', 'completed', 'canceled'],
          maxSelect: 1,
        },
        { name: 'notes', type: 'text', required: false },
        {
          name: 'customers',
          type: 'relation',
          required: false,
          collectionId: customersId,
          maxSelect: 50,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_excursoes_agent ON excursoes (agent)',
        'CREATE INDEX idx_excursoes_departure ON excursoes (departure_date)',
        'CREATE INDEX idx_excursoes_status ON excursoes (status)',
      ],
    })

    app.save(collection)

    let agentId = ''
    try {
      const agent = app.findFirstRecordByFilter('users', 'role = "agent"')
      agentId = agent.id
    } catch (_) {
      try {
        const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
        agentId = admin.id
      } catch (_) {}
    }

    if (agentId) {
      const excCol = app.findCollectionByNameOrId('excursoes')
      const now = new Date()
      const samples = [
        {
          title: 'Excursão Goiânia - Brás SP',
          oc: 'Goiânia',
          dc: 'São Paulo (Brás)',
          oh: '44_goiania',
          dh: 'bras_sp',
          st: 'scheduled',
        },
        {
          title: 'Excursão Bom Retiro - Goiânia',
          oc: 'São Paulo (Bom Retiro)',
          dc: 'Goiânia',
          oh: 'bom_retiro_sp',
          dh: '44_goiania',
          st: 'completed',
        },
      ]
      for (const s of samples) {
        try {
          app.findFirstRecordByFilter('excursoes', 'title = {:t}', { t: s.title })
        } catch (_) {
          const r = new Record(excCol)
          r.set('agent', agentId)
          r.set('title', s.title)
          r.set('origin_city', s.oc)
          r.set('destination_city', s.dc)
          r.set('origin_hub', s.oh)
          r.set('destination_hub', s.dh)
          r.set('status', s.st)
          r.set(
            'departure_date',
            new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0],
          )
          r.set('return_date', new Date(now.getTime() + 9 * 86400000).toISOString().split('T')[0])
          app.save(r)
        }
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('excursoes'))
    } catch (_) {}
  },
)
