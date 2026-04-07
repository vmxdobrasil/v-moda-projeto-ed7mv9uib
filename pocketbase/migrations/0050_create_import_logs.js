migrate(
  (app) => {
    const collection = new Collection({
      name: 'import_logs',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: null,
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'filename', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['processing', 'success', 'partial_success', 'failed'],
        },
        { name: 'total_records', type: 'number', required: false },
        { name: 'processed_records', type: 'number', required: false },
        { name: 'error_summary', type: 'text', required: false },
        { name: 'error_details', type: 'json', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_import_logs_user ON import_logs (user)',
        'CREATE INDEX idx_import_logs_created ON import_logs (created DESC)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('import_logs')
    app.delete(collection)
  },
)
