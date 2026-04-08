migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('video_sessions')

    if (!collection.fields.getByName('negotiation_notes')) {
      collection.fields.add(
        new TextField({
          name: 'negotiation_notes',
        }),
      )
    }

    if (!collection.fields.getByName('recording')) {
      collection.fields.add(
        new FileField({
          name: 'recording',
          maxSelect: 1,
          maxSize: 524288000,
          mimeTypes: ['video/webm', 'video/mp4', 'video/x-matroska', 'application/octet-stream'],
        }),
      )
    }

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('video_sessions')

    if (collection.fields.getByName('negotiation_notes')) {
      collection.fields.removeByName('negotiation_notes')
    }

    if (collection.fields.getByName('recording')) {
      collection.fields.removeByName('recording')
    }

    app.save(collection)
  },
)
