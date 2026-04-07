migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')

    if (!col.fields.getByName('whatsapp_group_name')) {
      col.fields.add(
        new TextField({
          name: 'whatsapp_group_name',
          required: false,
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')

    if (col.fields.getByName('whatsapp_group_name')) {
      col.fields.removeByName('whatsapp_group_name')
      app.save(col)
    }
  },
)
