migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('channels')
    col.addIndex('idx_channels_type', false, 'type', '')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('channels')
    col.removeIndex('idx_channels_type')
    app.save(col)
  },
)
