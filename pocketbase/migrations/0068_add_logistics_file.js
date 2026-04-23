migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    if (!col.fields.getByName('logistics_file')) {
      col.fields.add(
        new FileField({
          name: 'logistics_file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.fields.removeByName('logistics_file')
    app.save(col)
  },
)
