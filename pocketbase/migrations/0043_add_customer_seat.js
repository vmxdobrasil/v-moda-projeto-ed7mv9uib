migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    if (!col.fields.getByName('seat_number')) {
      col.fields.add(new NumberField({ name: 'seat_number', min: 1, max: 100 }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.fields.removeByName('seat_number')
    app.save(col)
  },
)
