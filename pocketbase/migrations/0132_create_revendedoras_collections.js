migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    const revendedoras = new Collection({
      name: 'revendedoras',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '',
      updateRule: "@request.auth.id != ''",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        { name: 'user', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'name', type: 'text', required: true },
        { name: 'cpf', type: 'text', required: true },
        { name: 'whatsapp', type: 'text', required: true },
        { name: 'region', type: 'text', required: true },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        {
          name: 'tier',
          type: 'select',
          values: ['bronze', 'prata', 'ouro', 'diamante'],
          maxSelect: 1,
        },
        { name: 'total_points', type: 'number' },
        { name: 'monthly_points', type: 'number' },
        { name: 'total_sales', type: 'number' },
        { name: 'status', type: 'select', values: ['active', 'inactive', 'pending'], maxSelect: 1 },
        {
          name: 'source',
          type: 'select',
          values: ['mgm', 'ads', 'whatsapp_group', 'direct'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_revendedoras_state ON revendedoras (state)',
        'CREATE INDEX idx_revendedoras_status ON revendedoras (status)',
        'CREATE INDEX idx_revendedoras_user ON revendedoras (user)',
      ],
    })
    app.save(revendedoras)

    const revCol = app.findCollectionByNameOrId('revendedoras')
    revCol.fields.add(
      new RelationField({ name: 'referrer', collectionId: revCol.id, maxSelect: 1 }),
    )
    app.save(revCol)

    const niveisRevenda = new Collection({
      name: 'niveis_revenda',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        {
          name: 'name',
          type: 'select',
          required: true,
          values: ['bronze', 'prata', 'ouro', 'diamante'],
          maxSelect: 1,
        },
        { name: 'min_points', type: 'number', required: true },
        { name: 'discount_percent', type: 'number', required: true },
        { name: 'benefits', type: 'text' },
        { name: 'color', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_niveis_revenda_name ON niveis_revenda (name)'],
    })
    app.save(niveisRevenda)

    const revendedorasId = app.findCollectionByNameOrId('revendedoras').id
    const projectsId = app.findCollectionByNameOrId('projects').id

    const pedidosRevenda = new Collection({
      name: 'pedidos_revenda',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        {
          name: 'revendedora',
          type: 'relation',
          required: true,
          collectionId: revendedorasId,
          maxSelect: 1,
        },
        {
          name: 'project',
          type: 'relation',
          required: true,
          collectionId: projectsId,
          maxSelect: 1,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['wholesale', 'dropshipping'],
          maxSelect: 1,
        },
        { name: 'quantity', type: 'number', required: true },
        { name: 'unit_price', type: 'number', required: true },
        { name: 'total_amount', type: 'number', required: true },
        { name: 'profit', type: 'number' },
        { name: 'points_earned', type: 'number' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'paid', 'delivered', 'canceled'],
          maxSelect: 1,
        },
        { name: 'client_name', type: 'text' },
        { name: 'client_phone', type: 'text' },
        { name: 'client_address', type: 'text' },
        { name: 'share_link', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_pedidos_revenda_revendedora ON pedidos_revenda (revendedora)',
        'CREATE INDEX idx_pedidos_revenda_status ON pedidos_revenda (status)',
      ],
    })
    app.save(pedidosRevenda)

    const pedidosId = app.findCollectionByNameOrId('pedidos_revenda').id

    const historicoPontos = new Collection({
      name: 'historico_pontos_revenda',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        {
          name: 'revendedora',
          type: 'relation',
          required: true,
          collectionId: revendedorasId,
          maxSelect: 1,
        },
        { name: 'order', type: 'relation', collectionId: pedidosId, maxSelect: 1 },
        { name: 'points', type: 'number', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['earned', 'redeemed'],
          maxSelect: 1,
        },
        { name: 'description', type: 'text' },
        { name: 'balance_after', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_hist_pontos_revendedora ON historico_pontos_revenda (revendedora)',
      ],
    })
    app.save(historicoPontos)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('historico_pontos_revenda'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('pedidos_revenda'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('niveis_revenda'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('revendedoras'))
    } catch (_) {}
  },
)
