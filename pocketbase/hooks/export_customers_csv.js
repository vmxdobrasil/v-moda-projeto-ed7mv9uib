routerAdd(
  'POST',
  '/backend/v1/export-customers-csv',
  (e) => {
    const body = e.requestInfo().body || {}
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')

    const userRole = e.auth?.getString('role') || ''
    const userEmail = e.auth?.getString('email') || ''
    const isAdmin = userRole === 'admin' || userEmail === 'valterpmendonca@gmail.com'

    const whereClauses = []
    const params = {}

    if (!isAdmin) {
      whereClauses.push('manufacturer = {:userId}')
      params.userId = userId
    }

    if (body.search) {
      const s = String(body.search).trim()
      if (s) {
        whereClauses.push(
          '(name LIKE {:search} OR phone LIKE {:search} OR whatsapp_group_name LIKE {:search} OR city LIKE {:search} OR state LIKE {:search})',
        )
        params.search = '%' + s + '%'
      }
    }

    if (body.source) {
      const s = String(body.source).trim()
      if (s === 'whatsapp') {
        whereClauses.push(
          "(source = 'whatsapp' OR source = 'whatsapp_group' OR (phone IS NOT NULL AND phone != ''))",
        )
      } else if (s === 'manual') {
        whereClauses.push(
          "(source = 'manual' OR (source != 'whatsapp' AND source != 'whatsapp_group' AND (phone IS NULL OR phone = '')))",
        )
      } else if (s !== 'all') {
        whereClauses.push('source = {:source}')
        params.source = s
      }
    }

    if (body.status && body.status !== 'all') {
      whereClauses.push('status = {:status}')
      params.status = String(body.status).trim()
    }

    if (body.shippingMethod && body.shippingMethod !== 'all') {
      whereClauses.push('shipping_method = {:shippingMethod}')
      params.shippingMethod = String(body.shippingMethod).trim()
    }

    if (body.categoryId && body.categoryId !== 'all') {
      whereClauses.push('category_id = {:categoryId}')
      params.categoryId = String(body.categoryId).trim()
    }

    if (body.inactivityDays) {
      const days = parseInt(body.inactivityDays)
      if (days > 0) {
        const cutoff =
          new Date(Date.now() - days * 86400000).toISOString().replace('T', ' ').substring(0, 19) +
          'Z'
        whereClauses.push(
          "(last_contacted_at IS NULL OR last_contacted_at = '' OR last_contacted_at <= {:cutoff})",
        )
        params.cutoff = cutoff
      }
    }

    const whereSql = whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : ''
    const sql =
      'SELECT name, phone, whatsapp_group_name, city, state, source, status, created FROM customers' +
      whereSql +
      ' ORDER BY created DESC'

    function escapeCsv(val) {
      if (val === null || val === undefined) return ''
      const s = String(val)
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

    const isSingleShot = body.singleShot === true || body.page === undefined || body.page === null

    if (isSingleShot) {
      let rows = []
      try {
        $app.db().newQuery(sql).bind(params).all(rows)
      } catch (err) {
        return e.json(500, {
          error: 'Failed to query customers: ' + (err.message || 'unknown error'),
        })
      }

      const totalRecords = rows.length
      const csvLines = []
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        const name = r.name || ''
        const phone = r.phone || ''
        const groupName = r.whatsapp_group_name || ''
        const city = r.city || ''
        const state = r.state || ''
        const source = r.source || ''
        const status = r.status || ''
        const created = (r.created || '').split(' ')[0] || ''
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

      const csvContent = csvLines.length > 0 ? csvLines.join('\n') + '\n' : ''

      return e.json(200, {
        csvChunk: csvContent,
        totalRecords: totalRecords,
        page: 1,
        totalPages: 1,
        hasMore: false,
      })
    }

    // Paginated fallback if specifically requested by a legacy client
    const page = Math.max(1, parseInt(body.page) || 1)
    const perPage = Math.min(5000, Math.max(1, parseInt(body.perPage) || 500))
    const offset = (page - 1) * perPage

    let countModel = new DynamicModel({ total: 0 })
    try {
      $app
        .db()
        .newQuery('SELECT COUNT(*) as total FROM customers' + whereSql)
        .bind(params)
        .one(countModel)
    } catch (_) {
      countModel.total = 0
    }
    const totalRecords = countModel.total || 0

    let rows = []
    try {
      const paginatedSql = sql + ' LIMIT ' + perPage + ' OFFSET ' + offset
      $app.db().newQuery(paginatedSql).bind(params).all(rows)
    } catch (err) {
      return e.json(500, {
        error: 'Failed to query customers: ' + (err.message || 'unknown error'),
      })
    }

    const totalPages = perPage > 0 ? Math.ceil(totalRecords / perPage) : 1
    const hasMore = page < totalPages

    const csvLines = []
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      const name = r.name || ''
      const phone = r.phone || ''
      const groupName = r.whatsapp_group_name || ''
      const city = r.city || ''
      const state = r.state || ''
      const source = r.source || ''
      const status = r.status || ''
      const created = (r.created || '').split(' ')[0] || ''
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
