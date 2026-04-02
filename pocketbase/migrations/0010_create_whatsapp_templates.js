migrate(
  (app) => {
    const collection = new Collection({
      name: 'whatsapp_templates',
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
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        {
          name: 'trigger_event',
          type: 'select',
          required: true,
          values: ['welcome_message', 'ranking_promotion', 'benefit_alert'],
        },
        { name: 'content', type: 'text', required: true },
        { name: 'is_active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_whatsapp_templates_user ON whatsapp_templates (user)',
        'CREATE INDEX idx_whatsapp_templates_trigger ON whatsapp_templates (trigger_event)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('whatsapp_templates')
    app.delete(collection)
  },
)
