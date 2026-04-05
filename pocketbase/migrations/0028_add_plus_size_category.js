migrate(
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    const rankingField = customers.fields.getByName('ranking_category')
    if (rankingField) {
      const vals = rankingField.values || []
      if (!vals.includes('plus_size')) {
        rankingField.values = [...vals, 'plus_size']
        app.save(customers)
      }
    }

    const projects = app.findCollectionByNameOrId('projects')
    const categoryField = projects.fields.getByName('category')
    if (categoryField) {
      const vals = categoryField.values || []
      if (!vals.includes('plus_size')) {
        categoryField.values = [...vals, 'plus_size']
        app.save(projects)
      }
    }
  },
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    const rankingField = customers.fields.getByName('ranking_category')
    if (rankingField) {
      const vals = rankingField.values || []
      rankingField.values = vals.filter((v) => v !== 'plus_size')
      app.save(customers)
    }

    const projects = app.findCollectionByNameOrId('projects')
    const categoryField = projects.fields.getByName('category')
    if (categoryField) {
      const vals = categoryField.values || []
      categoryField.values = vals.filter((v) => v !== 'plus_size')
      app.save(projects)
    }
  },
)
