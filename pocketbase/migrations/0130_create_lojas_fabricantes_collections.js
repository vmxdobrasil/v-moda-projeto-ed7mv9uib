migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    const leadsFabricantes = new Collection({
      name: 'leads_fabricantes',
      type: 'base',
      listRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      viewRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      createRule: '',
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: [
            'moda_feminina',
            'jeans',
            'moda_praia',
            'moda_masculina',
            'moda_fitness',
            'plus_size',
            'moda_evangelica',
            'moda_country',
            'moda_infantil',
            'bijouterias_semijoias',
            'calcados',
          ],
          maxSelect: 1,
        },
        { name: 'whatsapp', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'utm_source', type: 'text' },
        { name: 'utm_medium', type: 'text' },
        { name: 'utm_campaign', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'contacted', 'approved', 'rejected'],
          maxSelect: 1,
        },
        { name: 'manufacturer', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_leads_fab_status ON leads_fabricantes (status)'],
    })
    app.save(leadsFabricantes)

    const campanhasMarketing = new Collection({
      name: 'campanhas_marketing',
      type: 'base',
      listRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      viewRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      createRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'source', type: 'text' },
        { name: 'medium', type: 'text' },
        { name: 'campaign', type: 'text' },
        { name: 'url', type: 'url' },
        { name: 'clicks', type: 'number', onlyInt: true },
        { name: 'conversions', type: 'number', onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(campanhasMarketing)

    const unidadesLojas = new Collection({
      name: 'unidades_lojas',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (manufacturer = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com')",
      deleteRule:
        "@request.auth.id != '' && (manufacturer = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com')",
      fields: [
        {
          name: 'manufacturer',
          type: 'relation',
          required: true,
          collectionId: usersId,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['factory', 'branch'],
          maxSelect: 1,
        },
        { name: 'address', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        {
          name: 'photos',
          type: 'file',
          maxSelect: 4,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'manager', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_unidades_lojas_mfr ON unidades_lojas (manufacturer)'],
    })
    app.save(unidadesLojas)

    const seedLeads = [
      {
        name: 'Moda Stella Atelier',
        category: 'moda_feminina',
        whatsapp: '11988887777',
        utm_source: 'whatsapp_grupo',
        status: 'pending',
      },
      {
        name: 'Denim Culture Jeans',
        category: 'jeans',
        whatsapp: '62977776666',
        utm_source: 'instagram',
        status: 'contacted',
      },
      {
        name: 'Aqua Beach Wear',
        category: 'moda_praia',
        whatsapp: '62966665555',
        utm_source: 'facebook',
        status: 'approved',
      },
    ]
    const leadsCol = app.findCollectionByNameOrId('leads_fabricantes')
    for (const s of seedLeads) {
      try {
        app.findFirstRecordByData('leads_fabricantes', 'name', s.name)
      } catch (_) {
        const r = new Record(leadsCol)
        r.set('name', s.name)
        r.set('category', s.category)
        r.set('whatsapp', s.whatsapp)
        r.set('utm_source', s.utm_source)
        r.set('status', s.status)
        app.save(r)
      }
    }

    const seedUnits = [
      {
        email: 'contato@bellamoda.com.br',
        name: 'Bella Moda - Bom Retiro',
        type: 'factory',
        address: 'Rua José Paulino, 123',
        phone: '1133334444',
        city: 'São Paulo',
        state: 'SP',
      },
      {
        email: 'contato@premiumjeans.com.br',
        name: 'Premium Jeans - 44 Goiânia',
        type: 'factory',
        address: 'Av. T-9, 456',
        phone: '6233335555',
        city: 'Goiânia',
        state: 'GO',
      },
      {
        email: 'contato@costabrava.com.br',
        name: 'Costa Brava - Fama Goiânia',
        type: 'factory',
        address: 'Rua Fama, 789',
        phone: '6233336666',
        city: 'Goiânia',
        state: 'GO',
      },
    ]
    const unidadesCol = app.findCollectionByNameOrId('unidades_lojas')
    for (const s of seedUnits) {
      try {
        const user = app.findAuthRecordByEmail('users', s.email)
        try {
          app.findFirstRecordByData('unidades_lojas', 'name', s.name)
        } catch (_) {
          const r = new Record(unidadesCol)
          r.set('manufacturer', user.id)
          r.set('name', s.name)
          r.set('type', s.type)
          r.set('address', s.address)
          r.set('phone', s.phone)
          r.set('city', s.city)
          r.set('state', s.state)
          app.save(r)
        }
      } catch (_) {}
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('leads_fabricantes'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('campanhas_marketing'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('unidades_lojas'))
    } catch (_) {}
  },
)
