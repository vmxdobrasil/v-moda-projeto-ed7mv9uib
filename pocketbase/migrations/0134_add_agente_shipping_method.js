migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    const field = col.fields.getByName('shipping_method')
    if (field) {
      field.values = ['transportadora', 'correios', 'caravana_onibus', 'agente_credenciado']
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    const field = col.fields.getByName('shipping_method')
    if (field) {
      field.values = ['transportadora', 'correios', 'caravana_onibus']
    }
    app.save(col)
  },
)
