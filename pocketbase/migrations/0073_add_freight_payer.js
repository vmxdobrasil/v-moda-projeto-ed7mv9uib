migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    if (!col.fields.getByName('freight_payer')) {
      col.fields.add(
        new SelectField({
          name: 'freight_payer',
          values: ['manufacturer', 'retailer'],
          maxSelect: 1,
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.fields.removeByName('freight_payer')
    app.save(col)
  },
)
