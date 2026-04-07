migrate(
  (app) => {
    const collection = new Collection({
      name: 'video_sessions',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (host = @request.auth.id || participant = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (host = @request.auth.id || participant = @request.auth.id)",
      createRule: "@request.auth.id != '' && host = @request.auth.id",
      updateRule:
        "@request.auth.id != '' && (host = @request.auth.id || participant = @request.auth.id)",
      deleteRule:
        "@request.auth.id != '' && (host = @request.auth.id || participant = @request.auth.id)",
      fields: [
        {
          name: 'host',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'participant',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'active', 'ended', 'declined'],
        },
        { name: 'room_name', type: 'text', required: true },
        { name: 'started_at', type: 'date' },
        { name: 'ended_at', type: 'date' },
        { name: 'offer', type: 'json' },
        { name: 'answer', type: 'json' },
        { name: 'host_candidates', type: 'json' },
        { name: 'participant_candidates', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('video_sessions')
      app.delete(collection)
    } catch (_) {}
  },
)
