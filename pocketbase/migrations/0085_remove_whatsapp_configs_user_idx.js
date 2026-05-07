migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('whatsapp_configs')
    col.removeIndex('idx_whatsapp_configs_user')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('whatsapp_configs')
    col.addIndex('idx_whatsapp_configs_user', true, 'user', '')
    app.save(col)
  },
)
