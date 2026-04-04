migrate(
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    const rField = customers.fields.getByName('ranking_category')
    if (rField && !rField.values.includes('moda_fitness')) {
      rField.values.push('moda_fitness')
    }
    app.save(customers)

    const projects = app.findCollectionByNameOrId('projects')
    const cField = projects.fields.getByName('category')
    if (cField && !cField.values.includes('moda_fitness')) {
      cField.values.push('moda_fitness')
    }
    app.save(projects)
  },
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    const rField = customers.fields.getByName('ranking_category')
    if (rField) {
      rField.values = rField.values.filter((v) => v !== 'moda_fitness')
    }
    app.save(customers)

    const projects = app.findCollectionByNameOrId('projects')
    const cField = projects.fields.getByName('category')
    if (cField) {
      cField.values = cField.values.filter((v) => v !== 'moda_fitness')
    }
    app.save(projects)
  },
)
