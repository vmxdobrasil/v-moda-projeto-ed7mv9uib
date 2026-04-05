migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('resources')

    if (!col.fields.getByName('content_file')) {
      col.fields.add(
        new FileField({
          name: 'content_file',
          maxSelect: 1,
          maxSize: 104857600,
          mimeTypes: [
            'application/pdf',
            'video/mp4',
            'video/webm',
            'image/jpeg',
            'image/png',
            'image/webp',
          ],
        }),
      )
    }

    col.createRule = "@request.auth.id != '' && @request.auth.role = 'manufacturer'"
    col.updateRule = "@request.auth.id != '' && @request.auth.role = 'manufacturer'"
    col.deleteRule = "@request.auth.id != '' && @request.auth.role = 'manufacturer'"

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('resources')

    col.fields.removeByName('content_file')
    col.createRule = null
    col.updateRule = null
    col.deleteRule = null

    app.save(col)
  },
)
