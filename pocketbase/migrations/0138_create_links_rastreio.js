migrate(
  (app) => {
    const collection = new Collection({
      name: 'links_rastreio',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'original_url', type: 'url', required: true },
        { name: 'short_code', type: 'text', required: true },
        { name: 'clicks', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_links_rastreio_short_code ON links_rastreio (short_code)',
        'CREATE INDEX idx_links_rastreio_user ON links_rastreio (user)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('links_rastreio'))
    } catch (_) {}
  },
)
