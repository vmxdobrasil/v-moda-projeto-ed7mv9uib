migrate(
  (app) => {
    const settings = [
      {
        key: 'marketplace_total_commission',
        value_text: '13.89',
        name: 'Comissão Total do Marketplace (%)',
      },
      { key: 'gateway_fee_fixed', value_text: '2.99', name: 'Taxa Fixa do Gateway (R$)' },
      {
        key: 'gateway_fee_variable_max',
        value_text: '3.89',
        name: 'Taxa Variável Máxima do Gateway (%)',
      },
      {
        key: 'influencer_commission_rate',
        value_text: '1.0',
        name: 'Comissão de Influenciador (%)',
      },
      {
        key: 'shopping_guide_commission_rate',
        value_text: '2.0',
        name: 'Comissão de Guia de Compras (%)',
      },
    ]

    const col = app.findCollectionByNameOrId('brand_settings')
    for (const s of settings) {
      try {
        app.findFirstRecordByData('brand_settings', 'key', s.key)
      } catch (_) {
        const record = new Record(col)
        record.set('name', s.name)
        record.set('key', s.key)
        record.set('value_text', s.value_text)
        app.save(record)
      }
    }
  },
  (app) => {
    // Add down logic if needed in the future
  },
)
