migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.fields.add(new TextField({ name: 'bio' }))
    col.fields.add(new NumberField({ name: 'whatsapp_clicks' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.fields.removeByName('bio')
    col.fields.removeByName('whatsapp_clicks')
    app.save(col)
  },
)
