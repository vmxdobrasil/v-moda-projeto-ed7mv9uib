routerAdd(
  'POST',
  '/backend/v1/customers/analyze-duplicates',
  (e) => {
    const body = e.requestInfo().body || {}
    const phones = body.phones || []
    const userId = e.auth && e.auth.id

    if (!Array.isArray(phones) || phones.length === 0) {
      return e.json(200, { total: 0, newRecords: 0, duplicates: 0, duplicatePhones: [] })
    }

    var existingSet = {}
    var BATCH = 500
    for (var i = 0; i < phones.length; i += BATCH) {
      var batch = phones.slice(i, i + BATCH)
      var placeholders = batch
        .map(function (_, idx) {
          return '{:p' + idx + '}'
        })
        .join(',')
      var params = {}
      batch.forEach(function (p, idx) {
        params['p' + idx] = p
      })

      var sql = 'SELECT phone FROM customers WHERE phone IN (' + placeholders + ')'
      if (userId) {
        sql += ' AND (manufacturer = {:userId} OR affiliate_referrer = {:userId})'
        params.userId = userId
      }
      var rows = []
      $app.db().newQuery(sql).bind(params).all(rows)

      for (var j = 0; j < rows.length; j++) {
        existingSet[rows[j].phone] = true
      }
    }

    var duplicatePhones = phones.filter(function (p) {
      return existingSet[p]
    })
    var newCount = phones.length - duplicatePhones.length

    return e.json(200, {
      total: phones.length,
      newRecords: newCount,
      duplicates: duplicatePhones.length,
      duplicatePhones: duplicatePhones,
    })
  },
  $apis.requireAuth(),
)
