routerAdd(
  'POST',
  '/backend/v1/export-customers-csv',
  (e) => {
    const body = e.requestInfo().body || {}
    const page = Math.max(1, parseInt(body.page) || 1)
    const perPage = Math.min(1000, Math.max(1, parseInt(body.perPage) || 500))
    const offset = (page - 1) * perPage

    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')

    const userRole = e.auth?.getString('role') || ''
    const userEmail = e.auth?.getString('email') || ''
    const isAdmin = userRole === 'admin' || userEmail === 'valterpmendonca@gmail.com'

    const pbParts = []

    if (!isAdmin) {
      pbParts.push("manufacturer = '" + userId.replace(/'/g, "\\'") + "'")
    }

    if (body.search) {
      const s = String(body.search).replace(/'/g, "\\'")
      pbParts.push(
        "(name ~ '" +
          s +
          "' || phone ~ '" +
          s +
          "' || whatsapp_group_name ~ '" +
          s +
          "' || city ~ '" +
          s +
          "' || state ~ '" +
          s +
          "')",
      )
    }

    if (body.source) {
      const s = String(body.source).replace(/'/g, "\\'")
      if (s === 'whatsapp') {
        pbParts.push("(source = 'whatsapp' || source = 'whatsapp_group' || phone != '')")
      } else if (s === 'manual') {
        pbParts.push(
          "(source = 'manual' || (source != 'whatsapp' && source != 'whatsapp_group' && (phone = '' || phone = null)))",
        )
      } else if (s !== 'all') {
        pbParts.push("source = '" + s + "'")
      }
    }

    if (body.status) {
      const s = String(body.status).replace(/'/g, "\\'")
      pbParts.push("status = '" + s + "'")
    }

    if (body.shippingMethod) {
      const s = String(body.shippingMethod).replace(/'/g, "\\'")
      pbParts.push("shipping_method = '" + s + "'")
    }

    if (body.categoryId) {
      const s = String(body.categoryId).replace(/'/g, "\\'")
      pbParts.push("category_id = '" + s + "'")
    }

    if (body.inactivityDays) {
      const days = parseInt(body.inactivityDays)
      if (days > 0) {
        const cutoff = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
        pbParts.push("(last_contacted_at = '' || last_contacted_at <= '" + cutoff + "')")
      }
    }

    const pbFilter = pbParts.join(' && ')

    let totalRecords = 0
    try {
      const allRecs = $app.findRecordsByFilter('customers', pbFilter, '-created', 0, 0)
      totalRecords = allRecs.length
    } catch (_) {
      totalRecords = 0
    }

    let records = []
    try {
      records = $app.findRecordsByFilter('customers', pbFilter, '-created', perPage, offset)
    } catch (err) {
      return e.json(500, {
        error: 'Failed to query customers: ' + (err.message || 'unknown error'),
      })
    }

    const totalPages = perPage > 0 ? Math.ceil(totalRecords / perPage) : 1
    const hasMore = page < totalPages

    function escapeCsv(val) {
      const s = String(val || '')
      if (
        s.indexOf(',') !== -1 ||
        s.indexOf('"') !== -1 ||
        s.indexOf('\n') !== -1 ||
        s.indexOf('\r') !== -1
      ) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    }

    const csvLines = []
    for (const record of records) {
      const name = record.getString('name') || ''
      const phone = record.getString('phone') || ''
      const groupName = record.getString('whatsapp_group_name') || ''
      const city = record.getString('city') || ''
      const state = record.getString('state') || ''
      const source = record.getString('source') || ''
      const status = record.getString('status') || ''
      const created = (record.getString('created') || '').split(' ')[0] || ''
      csvLines.push(
        escapeCsv(name) +
          ',' +
          escapeCsv(phone) +
          ',' +
          escapeCsv(groupName) +
          ',' +
          escapeCsv(city) +
          ',' +
          escapeCsv(state) +
          ',' +
          escapeCsv(source) +
          ',' +
          escapeCsv(status) +
          ',' +
          escapeCsv(created),
      )
    }

    const csvChunk = csvLines.length > 0 ? csvLines.join('\n') + '\n' : ''

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
