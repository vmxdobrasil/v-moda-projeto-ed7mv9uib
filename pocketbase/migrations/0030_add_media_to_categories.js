migrate(
  (app) => {
    const categories = app.findCollectionByNameOrId('categories')

    if (!categories.fields.getByName('thumbnail')) {
      categories.fields.add(
        new FileField({
          name: 'thumbnail',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
        }),
      )
    }

    if (!categories.fields.getByName('banner')) {
      categories.fields.add(
        new FileField({
          name: 'banner',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
        }),
      )
    }

    // Ensure access rules
    categories.listRule = ''
    categories.viewRule = ''
    categories.createRule = "@request.auth.id != ''"
    categories.updateRule = "@request.auth.id != ''"
    categories.deleteRule = "@request.auth.id != ''"

    app.save(categories)
  },
  (app) => {
    const categories = app.findCollectionByNameOrId('categories')
    categories.fields.removeByName('thumbnail')
    categories.fields.removeByName('banner')
    app.save(categories)
  },
)
