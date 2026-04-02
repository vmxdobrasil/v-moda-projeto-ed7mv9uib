migrate(
  (app) => {
    const customersCol = app.findCollectionByNameOrId('customers')

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
    } catch (_) {
      return
    }

    const seedData = [
      {
        name: 'Boutique Maria',
        email: 'maria@example.com',
        status: 'converted',
        source: 'manual',
        ranking_category: 'moda_feminina',
        ranking_position: 1,
        exclusivity_zone: 'São Paulo - Centro',
        is_exclusive: true,
      },
      {
        name: 'Jeans Brasil',
        email: 'jeans@example.com',
        status: 'converted',
        source: 'manual',
        ranking_category: 'jeans',
        ranking_position: 1,
        exclusivity_zone: 'Campinas',
        is_exclusive: true,
      },
      {
        name: 'Sol & Mar Praia',
        email: 'praia@example.com',
        status: 'converted',
        source: 'instagram',
        ranking_category: 'moda_praia',
        ranking_position: 1,
        exclusivity_zone: 'Rio de Janeiro - Zona Sul',
        is_exclusive: true,
      },
      {
        name: 'Estilo Homem',
        email: 'homem@example.com',
        status: 'converted',
        source: 'whatsapp',
        ranking_category: 'moda_masculina',
        ranking_position: 1,
        exclusivity_zone: 'Belo Horizonte',
        is_exclusive: true,
      },
      {
        name: 'Moda Kids Center',
        email: 'kids@example.com',
        status: 'converted',
        source: 'manual',
        ranking_category: 'moda_infantil',
        ranking_position: 1,
        exclusivity_zone: 'Curitiba',
        is_exclusive: true,
      },
    ]

    for (const data of seedData) {
      try {
        app.findFirstRecordByData('customers', 'email', data.email)
      } catch (_) {
        const record = new Record(customersCol)
        record.set('name', data.name)
        record.set('email', data.email)
        record.set('status', data.status)
        record.set('source', data.source)
        record.set('manufacturer', admin.id)
        record.set('ranking_category', data.ranking_category)
        record.set('ranking_position', data.ranking_position)
        record.set('exclusivity_zone', data.exclusivity_zone)
        record.set('is_exclusive', data.is_exclusive)
        app.save(record)
      }
    }
  },
  (app) => {
    const seedEmails = [
      'maria@example.com',
      'jeans@example.com',
      'praia@example.com',
      'homem@example.com',
      'kids@example.com',
    ]
    for (const email of seedEmails) {
      try {
        const record = app.findFirstRecordByData('customers', 'email', email)
        app.delete(record)
      } catch (_) {}
    }
  },
)
