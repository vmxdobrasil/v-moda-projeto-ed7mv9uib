migrate(
  (app) => {
    const categoriesCol = app.findCollectionByNameOrId('categories')

    const existingCategories = [
      { name: 'Moda Feminina', slug: 'moda_feminina' },
      { name: 'Jeans', slug: 'jeans' },
      { name: 'Moda Praia', slug: 'moda_praia' },
      { name: 'Moda Geral', slug: 'moda_geral' },
      { name: 'Moda Masculina', slug: 'moda_masculina' },
      { name: 'Moda Evangélica', slug: 'moda_evangelica' },
      { name: 'Moda Country', slug: 'moda_country' },
      { name: 'Moda Infantil', slug: 'moda_infantil' },
      { name: 'Bijouterias / Semijoias', slug: 'bijouterias_semijoias' },
      { name: 'Calçados', slug: 'calcados' },
      { name: 'Moda Fitness', slug: 'moda_fitness' },
    ]

    for (const cat of existingCategories) {
      let record
      try {
        record = app.findFirstRecordByData('categories', 'slug', cat.slug)
      } catch (_) {
        record = new Record(categoriesCol)
        record.set('name', cat.name)
        record.set('slug', cat.slug)
        app.save(record)
      }

      app
        .db()
        .newQuery('UPDATE customers SET category_id = {:id} WHERE ranking_category = {:slug}')
        .bind({ id: record.id, slug: cat.slug })
        .execute()

      app
        .db()
        .newQuery('UPDATE projects SET category_id = {:id} WHERE category = {:slug}')
        .bind({ id: record.id, slug: cat.slug })
        .execute()
    }
  },
  (app) => {
    app.db().newQuery("UPDATE customers SET category_id = ''").execute()
    app.db().newQuery("UPDATE projects SET category_id = ''").execute()

    const categoriesCol = app.findCollectionByNameOrId('categories')
    app.truncateCollection(categoriesCol)
  },
)
