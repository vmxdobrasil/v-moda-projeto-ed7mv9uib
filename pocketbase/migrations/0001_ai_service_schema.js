migrate(
  (app) => {
    const channels = new Collection({
      name: 'channels',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          values: ['whatsapp', 'instagram', 'email'],
          required: true,
        },
        { name: 'status', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(channels)

    const messages = new Collection({
      name: 'messages',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'channel',
          type: 'relation',
          collectionId: channels.id,
          maxSelect: 1,
          required: true,
        },
        { name: 'sender_id', type: 'text', required: true },
        { name: 'sender_name', type: 'text' },
        { name: 'content', type: 'text', required: true },
        { name: 'direction', type: 'select', values: ['inbound', 'outbound'], required: true },
        { name: 'ai_suggested_reply', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['pending', 'replied', 'archived'],
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_messages_channel ON messages (channel)',
        'CREATE INDEX idx_messages_status ON messages (status)',
        'CREATE INDEX idx_messages_created ON messages (created DESC)',
      ],
    })
    app.save(messages)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('messages'))
    app.delete(app.findCollectionByNameOrId('channels'))
  },
)
