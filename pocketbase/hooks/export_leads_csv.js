routerAdd(
  'POST',
  '/backend/v1/export-leads-csv',
  (e) => {
    const body = e.requestInfo().body || {}
    const collection = body.collection || 'leads_fabricantes'
    const page = Math.max(1, parseInt(body.page) || 1)
    const perPage = Math.min(1000, Math.max(1, parseInt(body.perPage) || 500))
    const offset = (page - 1) * perPage

    const userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var validCollections = ['leads_venda', 'leads_fabricantes', 'leads_retailers']
    if (validCollections.indexOf(collection) === -1) {
      return e.badRequestError('Invalid collection: ' + collection)
    }

    var pbParts = []
    if (body.search) {
      var s = String(body.search).replace(/'/g, "\\'")
      if (collection === 'leads_fabricantes') {
        pbParts.push("(name ~ '" + s + "' || whatsapp ~ '" + s + "' || email ~ '" + s + "')")
      } else if (collection === 'leads_retailers') {
        pbParts.push(
          "(store_name ~ '" +
            s +
            "' || contact_name ~ '" +
            s +
            "' || phone ~ '" +
            s +
            "' || email ~ '" +
            s +
            "')",
        )
      } else {
        pbParts.push("(message ~ '" + s + "')")
      }
    }
    if (body.status) {
      pbParts.push("status = '" + String(body.status).replace(/'/g, "\\'") + "'")
    }
    if (body.source && (collection === 'leads_fabricantes' || collection === 'leads_retailers')) {
      pbParts.push("utm_source = '" + String(body.source).replace(/'/g, "\\'") + "'")
    }

    var pbFilter = pbParts.join(' && ')

    var totalRecords = 0
    try {
      var allRecs = $app.findRecordsByFilter(collection, pbFilter, '-created', 0, 0)
      totalRecords = allRecs.length
    } catch (_) {
      totalRecords = 0
    }

    var records = []
    try {
      records = $app.findRecordsByFilter(collection, pbFilter, '-created', perPage, offset)
    } catch (err) {
      return e.json(500, { error: 'Failed to query: ' + (err.message || 'unknown') })
    }

    var totalPages = perPage > 0 ? Math.ceil(totalRecords / perPage) : 1
    var hasMore = page < totalPages

    function escapeCsv(val) {
      var s = String(val || '')
      if (s.indexOf(';') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    }

    var csvLines = []
    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      var name = ''
      var phone = ''
      var email = r.getString('email') || ''
      var source = ''

      if (collection === 'leads_fabricantes') {
        name = r.getString('name') || ''
        phone = r.getString('whatsapp') || ''
        source = r.getString('utm_source') || ''
      } else if (collection === 'leads_retailers') {
        name = r.getString('store_name') || ''
        phone = r.getString('phone') || ''
        source = r.getString('utm_source') || ''
      } else {
        name = (r.getString('message') || '').substring(0, 80) || 'Lead Venda'
      }

      csvLines.push(
        escapeCsv(collection) +
          ';' +
          escapeCsv(name) +
          ';' +
          escapeCsv(phone) +
          ';' +
          escapeCsv(email) +
          ';' +
          escapeCsv(source) +
          ';' +
          escapeCsv(r.getString('status') || '') +
          ';' +
          escapeCsv(r.getString('notes') || '') +
          ';' +
          escapeCsv(r.getCreated().split(' ')[0] || ''),
      )
    }

    var csvChunk = csvLines.length > 0 ? csvLines.join('\n') + '\n' : ''

    return e.json(200, {
      csvChunk: csvChunk,
      totalRecords: totalRecords,
      page: page,
      totalPages: totalPages,
      hasMore: hasMore,
    })
  },
  $apis.requireAuth(),
)
