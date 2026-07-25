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
    const sqlParts = []
    const sqlParams = {}

    if (!isAdmin) {
      pbParts.push("manufacturer = '" + userId.replace(/'/g, "\\'") + "'")
      sqlParts.push('manufacturer = {:manufacturerId}')
      sqlParams.manufacturerId = userId
    }

    if (body.search) {
      const s = String(body.search).replace(/'/g, "\\'")
      const likePattern = '%' + String(body.search) + '%'
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
      sqlParts.push(
        '(name LIKE {:search} OR phone LIKE {:search} OR whatsapp_group_name LIKE {:search} OR city LIKE {:search} OR state LIKE {:search})',
      )
      sqlParams.search = likePattern
    }

    if (body.status) {
      const s = String(body.status).replace(/'/g, "\\'")
      pbParts.push("status = '" + s + "'")
      sqlParts.push('status = {:status}')
      sqlParams.status = String(body.status)
    }

    if (body.shippingMethod) {
      const s = String(body.shippingMethod).replace(/'/g, "\\'")
      pbParts.push("shipping_method = '" + s + "'")
      sqlParts.push('shipping_method = {:shippingMethod}')
      sqlParams.shippingMethod = String(body.shippingMethod)
    }

    if (body.categoryId) {
      const s = String(body.categoryId).replace(/'/g, "\\'")
      pbParts.push("category_id = '" + s + "'")
      sqlParts.push('category_id = {:categoryId}')
      sqlParams.categoryId = String(body.categoryId)
    }

    if (body.inactivityDays) {
      const days = parseInt(body.inactivityDays)
      if (days > 0) {
        const cutoff = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
        pbParts.push("(last_contacted_at = '' || last_contacted_at <= '" + cutoff + "')")
        sqlParts.push(
          "(last_contacted_at IS NULL OR last_contacted_at = '' OR last_contacted_at <= {:cutoff})",
        )
        sqlParams.cutoff = cutoff
      }
    }

    const pbFilter = pbParts.join(' && ')
    const sqlWhere = sqlParts.length > 0 ? ' WHERE ' + sqlParts.join(' AND ') : ''

    let totalRecords = 0
    try {
      const countModel = new DynamicModel({ count: 0 })
      let countQuery = $app.db().newQuery('SELECT COUNT(*) as count FROM customers' + sqlWhere)
      if (Object.keys(sqlParams).length > 0) {
        countQuery = countQuery.bind(sqlParams)
      }
      countQuery.one(countModel)
      totalRecords = countModel.count
    } catch (_) {
      try {
        const allRecs = $app.findRecordsByFilter('customers', pbFilter, '-created', 0, 0)
        totalRecords = allRecs.length
      } catch (_) {
        totalRecords = 0
      }
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
      const phone = record.getString('phone') || ''
      const groupName = record.getString('whatsapp_group_name') || ''
      const city = record.getString('city') || ''
      const state = record.getString('state') || ''
      csvLines.push(
        escapeCsv(phone) +
          ',' +
          escapeCsv(groupName) +
          ',' +
          escapeCsv(city) +
          ',' +
          escapeCsv(state),
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
