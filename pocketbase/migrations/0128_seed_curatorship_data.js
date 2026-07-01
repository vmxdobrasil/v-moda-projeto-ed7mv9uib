migrate(
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')

    let adminId = ''
    try {
      const admin = app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')
      adminId = admin.id
    } catch (_) {}

    const brands = [
      { name: 'Brand A - Feminina', category: 'moda_feminina', position: 1 },
      { name: 'Brand B - Feminina', category: 'moda_feminina', position: 2 },
      { name: 'Brand C - Jeans', category: 'jeans', position: 1 },
      { name: 'Brand D - Jeans', category: 'jeans', position: 2 },
      { name: 'Brand E - Jeans', category: 'jeans', position: 3 },
    ]

    for (const brand of brands) {
      try {
        app.findFirstRecordByData('customers', 'name', brand.name)
      } catch (_) {
        const record = new Record(customers)
        record.set('name', brand.name)
        record.set('ranking_category', brand.category)
        record.set('ranking_position', brand.position)
        record.set('status', 'converted')
        record.set('is_verified', true)
        if (adminId) record.set('manufacturer', adminId)
        app.save(record)
      }
    }

    const limits = {
      moda_feminina: 15,
      jeans: 10,
      moda_praia: 5,
      moda_masculina: 5,
      moda_fitness: 5,
      plus_size: 5,
      moda_evangelica: 5,
      moda_country: 5,
      moda_infantil: 5,
      bijouterias_semijoias: 3,
      calcados: 2,
    }

    for (const [slug, limit] of Object.entries(limits)) {
      try {
        const cat = app.findFirstRecordByData('categories', 'slug', slug)
        cat.set('ranking_limit', limit)
        app.save(cat)
      } catch (_) {}
    }
  },
  (app) => {},
)
