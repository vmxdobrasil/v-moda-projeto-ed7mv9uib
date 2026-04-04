migrate(
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    let adminId

    try {
      const admin = app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')
      adminId = admin.id
    } catch (_) {
      const users = app.findCollectionByNameOrId('users')
      const newAdmin = new Record(users)
      newAdmin.setEmail('valterpmendonca@gmail.com')
      newAdmin.setPassword('Skip@Pass')
      newAdmin.setVerified(true)
      newAdmin.set('name', 'Admin')
      app.save(newAdmin)
      adminId = newAdmin.id
    }

    const distribution = [
      { category: 'moda_feminina', count: 15, namePrefix: 'Feminina' },
      { category: 'jeans', count: 10, namePrefix: 'Jeans' },
      { category: 'moda_praia', count: 5, namePrefix: 'Praia' },
      { category: 'moda_masculina', count: 5, namePrefix: 'Masculina' },
      { category: 'moda_fitness', count: 5, namePrefix: 'Fitness' },
      { category: 'moda_evangelica', count: 5, namePrefix: 'Evangélica' },
      { category: 'moda_country', count: 5, namePrefix: 'Country' },
      { category: 'moda_infantil', count: 5, namePrefix: 'Infantil' },
      { category: 'bijouterias_semijoias', count: 3, namePrefix: 'Biju' },
      { category: 'calcados', count: 2, namePrefix: 'Calçados' },
    ]

    for (const group of distribution) {
      for (let i = 1; i <= group.count; i++) {
        const name = `Top ${group.namePrefix} ${i}`
        try {
          app.findFirstRecordByData('customers', 'name', name)
        } catch (_) {
          const record = new Record(customers)
          record.set('name', name)
          record.set('manufacturer', adminId)
          record.set('ranking_category', group.category)
          record.set('ranking_position', i)
          record.set('status', 'converted')
          record.set('is_verified', true)
          app.save(record)
        }
      }
    }
  },
  (app) => {
    // Not rolling back seeded data
  },
)
