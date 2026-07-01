migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!users.fields.getByName('social_name')) {
      users.fields.add(new TextField({ name: 'social_name' }))
    }
    if (!users.fields.getByName('minimum_order')) {
      users.fields.add(new NumberField({ name: 'minimum_order' }))
    }
    app.save(users)

    const customers = app.findCollectionByNameOrId('customers')
    if (!customers.fields.getByName('fashion_hub')) {
      customers.fields.add(
        new SelectField({
          name: 'fashion_hub',
          values: ['44_goiania', 'fama_goiania', 'bras_sp', 'bom_retiro_sp', 'outros'],
          maxSelect: 1,
        }),
      )
    }
    app.save(customers)

    const customersId = customers.id

    const leadsVenda = new Collection({
      name: 'leads_venda',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (retailer = @request.auth.id || manufacturer = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com')",
      viewRule:
        "@request.auth.id != '' && (retailer = @request.auth.id || manufacturer = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com')",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (manufacturer = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com')",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        {
          name: 'retailer',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'manufacturer',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'brand',
          type: 'relation',
          required: false,
          collectionId: customersId,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'contacted', 'converted', 'closed'],
          maxSelect: 1,
        },
        { name: 'message', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_leads_venda_manufacturer ON leads_venda (manufacturer)',
        'CREATE INDEX idx_leads_venda_retailer ON leads_venda (retailer)',
      ],
    })
    app.save(leadsVenda)

    const seeds = [
      {
        name: 'Bella Moda Atelier',
        email: 'contato@bellamoda.com.br',
        brand: 'Bella Moda Feminina',
        category: 'moda_feminina',
        city: 'São Paulo',
        state: 'SP',
        hub: 'bom_retiro_sp',
        bio: 'Marca especializada em moda feminina contemporânea, com peças exclusivas e tecidos premium. Atendimento direto do Bom Retiro.',
        phone: '1133334444',
        tax_id: '12.345.678/0001-90',
      },
      {
        name: 'Premium Jeans Wear',
        email: 'contato@premiumjeans.com.br',
        brand: 'Premium Jeans',
        category: 'jeans',
        city: 'Goiânia',
        state: 'GO',
        hub: '44_goiania',
        bio: 'Fabricante de jeans premium com mais de 15 anos de experiência. Modelagem exclusiva e lavagens diferenciadas.',
        phone: '6233335555',
        tax_id: '23.456.789/0001-01',
      },
      {
        name: 'Costa Brava Praia',
        email: 'contato@costabrava.com.br',
        brand: 'Costa Brava Moda Praia',
        category: 'moda_praia',
        city: 'Goiânia',
        state: 'GO',
        hub: 'fama_goiania',
        bio: 'Moda praia e fitness com estampas exclusivas. Produção própria no polo da Fama em Goiânia.',
        phone: '6233336666',
        tax_id: '34.567.890/0001-12',
      },
    ]

    for (const seed of seeds) {
      let userId = ''
      try {
        const existing = app.findAuthRecordByEmail('users', seed.email)
        userId = existing.id
      } catch (_) {
        const userRecord = new Record(users)
        userRecord.setEmail(seed.email)
        userRecord.setPassword('Skip@Pass')
        userRecord.setVerified(true)
        userRecord.set('name', seed.name)
        userRecord.set('role', 'manufacturer')
        userRecord.set('brand_name', seed.brand)
        userRecord.set('is_verified', true)
        userRecord.set('fashion_hubs', seed.hub)
        userRecord.set('tax_id', seed.tax_id)
        userRecord.set('phone', seed.phone)
        userRecord.set('minimum_order', 500)
        app.save(userRecord)
        userId = userRecord.id
      }

      try {
        app.findFirstRecordByData('customers', 'name', seed.brand)
      } catch (_) {
        const record = new Record(customers)
        record.set('name', seed.brand)
        record.set('manufacturer', userId)
        record.set('status', 'converted')
        record.set('is_verified', true)
        record.set('city', seed.city)
        record.set('state', seed.state)
        record.set('bio', seed.bio)
        record.set('phone', seed.phone)
        record.set('ranking_category', seed.category)
        record.set('fashion_hub', seed.hub)
        record.set('source', 'manual')
        record.set('price_level', '$$')
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('leads_venda')
      app.delete(col)
    } catch (_) {}

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      users.fields.removeByName('social_name')
    } catch (_) {}
    try {
      users.fields.removeByName('minimum_order')
    } catch (_) {}
    app.save(users)

    const customers = app.findCollectionByNameOrId('customers')
    try {
      customers.fields.removeByName('fashion_hub')
    } catch (_) {}
    app.save(customers)
  },
)
