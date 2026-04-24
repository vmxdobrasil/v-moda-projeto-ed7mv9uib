migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')

    if (!col.fields.getByName('shipping_method')) {
      col.fields.add(
        new SelectField({
          name: 'shipping_method',
          values: ['transportadora', 'correios', 'caravana_onibus'],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('tracking_code')) {
      col.fields.add(
        new TextField({
          name: 'tracking_code',
        }),
      )
    }

    if (!col.fields.getByName('shipping_date')) {
      col.fields.add(
        new DateField({
          name: 'shipping_date',
        }),
      )
    }

    const logisticsStatusField = col.fields.getByName('logistics_status')
    if (logisticsStatusField) {
      logisticsStatusField.values = [
        'Aguardando Ônibus',
        'Em Trânsito no Ônibus',
        'Entregue',
        'Aguardando Envio',
        'Postado',
        'Em Trânsito',
      ]
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')

    col.fields.removeByName('shipping_method')
    col.fields.removeByName('tracking_code')
    col.fields.removeByName('shipping_date')

    const logisticsStatusField = col.fields.getByName('logistics_status')
    if (logisticsStatusField) {
      logisticsStatusField.values = ['Aguardando Ônibus', 'Em Trânsito no Ônibus', 'Entregue']
    }

    app.save(col)
  },
)
