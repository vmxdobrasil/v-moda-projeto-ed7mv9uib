migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')

    if (!col.fields.getByName('logistics_status')) {
      col.fields.add(
        new SelectField({
          name: 'logistics_status',
          maxSelect: 1,
          values: ['Aguardando Ônibus', 'Em Trânsito no Ônibus', 'Entregue'],
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    if (col.fields.getByName('logistics_status')) {
      col.fields.removeByName('logistics_status')
      app.save(col)
    }
  },
)
