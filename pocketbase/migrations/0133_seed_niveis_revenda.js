migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('niveis_revenda')

    const tiers = [
      {
        name: 'bronze',
        min_points: 0,
        discount_percent: 0,
        benefits: 'Acesso ao catalogo digital, treinamento basico',
        color: '#CD7F32',
      },
      {
        name: 'prata',
        min_points: 500,
        discount_percent: 5,
        benefits: '5% desconto em atacado, acesso antecipado a lancamentos',
        color: '#C0C0C0',
      },
      {
        name: 'ouro',
        min_points: 1500,
        discount_percent: 10,
        benefits: '10% desconto, frete reduzido, prioridade em estoque',
        color: '#FFD700',
      },
      {
        name: 'diamante',
        min_points: 5000,
        discount_percent: 15,
        benefits: '15% desconto, consultoria exclusiva, acesso VIP',
        color: '#B9F2FF',
      },
    ]

    for (const t of tiers) {
      try {
        app.findFirstRecordByData('niveis_revenda', 'name', t.name)
      } catch (_) {
        const r = new Record(col)
        r.set('name', t.name)
        r.set('min_points', t.min_points)
        r.set('discount_percent', t.discount_percent)
        r.set('benefits', t.benefits)
        r.set('color', t.color)
        app.save(r)
      }
    }
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter('niveis_revenda', '1=1', '', 100, 0)
      for (const r of records) app.delete(r)
    } catch (_) {}
  },
)
