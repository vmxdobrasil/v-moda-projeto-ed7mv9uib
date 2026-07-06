routerAdd(
  'GET',
  '/backend/v1/leads/geo-stats',
  (e) => {
    const userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var totalModel = new DynamicModel({ total: 0 })
    $app.db().newQuery('SELECT COUNT(*) as total FROM customers').one(totalModel)

    var retailerModel = new DynamicModel({ total: 0 })
    $app.db().newQuery('SELECT COUNT(*) as total FROM leads_retailers').one(retailerModel)

    var dddRows = []
    $app
      .db()
      .newQuery(
        "SELECT ddd, COUNT(*) as count FROM customers WHERE ddd != '' GROUP BY ddd ORDER BY count DESC LIMIT 50",
      )
      .all(dddRows)

    var stateRows = []
    $app
      .db()
      .newQuery(
        "SELECT state, COUNT(*) as count FROM customers WHERE state != '' GROUP BY state ORDER BY count DESC",
      )
      .all(stateRows)

    var regionRows = []
    $app
      .db()
      .newQuery(
        "SELECT CASE WHEN state IN ('SP','RJ','ES','MG') THEN 'Sudeste' WHEN state IN ('PR','SC','RS') THEN 'Sul' WHEN state IN ('AC','AP','AM','PA','RO','RR','TO') THEN 'Norte' WHEN state IN ('AL','BA','CE','MA','PB','PE','PI','RN','SE') THEN 'Nordeste' WHEN state IN ('DF','GO','MT','MS') THEN 'Centro-Oeste' ELSE 'Outros' END as region, COUNT(*) as count FROM customers WHERE state != '' GROUP BY region ORDER BY count DESC",
      )
      .all(regionRows)

    var cityRows = []
    $app
      .db()
      .newQuery(
        "SELECT city, state, COUNT(*) as count FROM customers WHERE city != '' GROUP BY city, state ORDER BY count DESC LIMIT 20",
      )
      .all(cityRows)

    return e.json(200, {
      totalLeads: totalModel.total,
      totalRetailerLeads: retailerModel.total,
      byDdd: dddRows,
      byState: stateRows,
      byRegion: regionRows,
      topCities: cityRows,
    })
  },
  $apis.requireAuth(),
)
