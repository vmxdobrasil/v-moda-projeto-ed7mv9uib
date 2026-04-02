migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')

    if (!col.fields.getByName('exclusivity_zone')) {
      col.fields.add(new TextField({ name: 'exclusivity_zone' }))
    }

    if (!col.fields.getByName('ranking_category')) {
      col.fields.add(
        new SelectField({
          name: 'ranking_category',
          values: [
            'moda_feminina',
            'jeans',
            'moda_praia',
            'moda_geral',
            'moda_masculina',
            'moda_evangelica',
            'moda_country',
            'moda_infantil',
            'bijouterias_semijoias',
            'calcados',
          ],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('ranking_position')) {
      col.fields.add(new NumberField({ name: 'ranking_position', min: 1, max: 15 }))
    }

    if (!col.fields.getByName('is_exclusive')) {
      col.fields.add(new BoolField({ name: 'is_exclusive' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.fields.removeByName('exclusivity_zone')
    col.fields.removeByName('ranking_category')
    col.fields.removeByName('ranking_position')
    col.fields.removeByName('is_exclusive')
    app.save(col)
  },
)
