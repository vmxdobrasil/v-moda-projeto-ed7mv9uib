migrate(
  (app) => {
    const collection = new Collection({
      name: 'categories',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_categories_slug ON categories (slug)'],
    })
    app.save(collection)

    const customers = app.findCollectionByNameOrId('customers')
    customers.fields.add(
      new RelationField({
        name: 'category_id',
        collectionId: collection.id,
        maxSelect: 1,
        cascadeDelete: false,
      }),
    )
    app.save(customers)

    const projects = app.findCollectionByNameOrId('projects')
    projects.fields.add(
      new RelationField({
        name: 'category_id',
        collectionId: collection.id,
        maxSelect: 1,
        cascadeDelete: false,
      }),
    )
    app.save(projects)
  },
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    customers.fields.removeByName('category_id')
    app.save(customers)

    const projects = app.findCollectionByNameOrId('projects')
    projects.fields.removeByName('category_id')
    app.save(projects)

    const collection = app.findCollectionByNameOrId('categories')
    app.delete(collection)
  },
)
