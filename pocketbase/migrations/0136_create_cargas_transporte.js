migrate(
  (app) => {
    const usersId = '_pb_users_auth_'
    const customersId = app.findCollectionByNameOrId('customers').id
    const excursoesId = app.findCollectionByNameOrId('excursoes').id
    let ordersId = ''
    try {
      ordersId = app.findCollectionByNameOrId('orders').id
    } catch (_) {}

    const fields = [
      { name: 'agent', type: 'relation', required: true, collectionId: usersId, maxSelect: 1 },
      {
        name: 'excursion',
        type: 'relation',
        required: false,
        collectionId: excursoesId,
        maxSelect: 1,
      },
      {
        name: 'customer',
        type: 'relation',
        required: false,
        collectionId: customersId,
        maxSelect: 1,
      },
      {
        name: 'manufacturer',
        type: 'relation',
        required: false,
        collectionId: usersId,
        maxSelect: 1,
      },
      { name: 'volume_count', type: 'number', required: false },
      { name: 'weight_kg', type: 'number', required: false },
      { name: 'description', type: 'text', required: false },
      { name: 'pickup_address', type: 'text', required: false },
      {
        name: 'delivery_status',
        type: 'select',
        required: true,
        values: ['pending', 'collected', 'in_transit', 'delivered', 'issue'],
        maxSelect: 1,
      },
      { name: 'qr_code_token', type: 'text', required: false },
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    if (ordersId) {
      fields.splice(4, 0, {
        name: 'order',
        type: 'relation',
        required: false,
        collectionId: ordersId,
        maxSelect: 1,
      })
    }

    const collection = new Collection({
      name: 'cargas_transporte',
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
      fields: fields,
      indexes: [],
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
      const cargoCol = app.findCollectionByNameOrId('cargas_transporte')
      let excursaoId = ''
      try {
        const exc = app.findFirstRecordByFilter('excursoes', 'status = "scheduled"')
        excursaoId = exc.id
      } catch (_) {}

      const samples = [
        { desc: 'Volume com 15 peças moda feminina', vol: 3, kg: 12.5, status: 'pending' },
        { desc: 'Volume com 8 peças jeans', vol: 2, kg: 8.0, status: 'in_transit' },
      ]

      for (const s of samples) {
        try {
          app.findFirstRecordByFilter('cargas_transporte', 'description = {:d}', { d: s.desc })
        } catch (_) {
          const r = new Record(cargoCol)
          r.set('agent', agentId)
          if (excursaoId) r.set('excursion', excursaoId)
          r.set('description', s.desc)
          r.set('volume_count', s.vol)
          r.set('weight_kg', s.kg)
          r.set('delivery_status', s.status)
          r.set('pickup_address', 'Galpão do Fabricante - Brás SP')
          app.save(r)
        }
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('cargas_transporte'))
    } catch (_) {}
  },
)
