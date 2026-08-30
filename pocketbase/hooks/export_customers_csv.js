routerAdd(
  'POST',
  '/backend/v1/export-customers-csv',
  (e) => {
    const body = e.requestInfo().body || {}
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')

    const userRole = e.auth?.getString('role') || ''
    const userEmail = e.auth?.getString('email') || ''
    const isAdmin =
      userRole === 'admin' ||
      userEmail === 'valterpmendonca@gmail.com' ||
      e.auth?.collectionName === '_superusers'

    const filterParts = []
    const params = {}

    if (!isAdmin) {
      filterParts.push('manufacturer = {:userId}')
      params.userId = userId
    }

    if (body.search) {
      const s = String(body.search).trim()
      if (s) {
        filterParts.push(
          '(name ~ {:search} || phone ~ {:search} || whatsapp_group_name ~ {:search} || city ~ {:search} || state ~ {:search})',
        )
        params.search = s
      }
    }

    if (body.source) {
      const s = String(body.source).trim()
      if (s === 'whatsapp') {
        filterParts.push(
          '(source = "whatsapp" || source = "whatsapp_group" || (phone != "" && phone != null))',
        )
      } else if (s === 'manual') {
        filterParts.push(
          '(source = "manual" || (source != "whatsapp" && source != "whatsapp_group" && (phone = "" || phone = null)))',
        )
      } else if (s !== 'all') {
        filterParts.push('source = {:source}')
        params.source = s
      }
    }

    if (body.status && body.status !== 'all') {
      filterParts.push('status = {:status}')
      params.status = String(body.status).trim()
    }

    if (body.shippingMethod && body.shippingMethod !== 'all') {
      filterParts.push('shipping_method = {:shippingMethod}')
      params.shippingMethod = String(body.shippingMethod).trim()
    }

    if (body.categoryId && body.categoryId !== 'all') {
      filterParts.push('category_id = {:categoryId}')
      params.categoryId = String(body.categoryId).trim()
    }

    if (body.inactivityDays) {
      const days = parseInt(body.inactivityDays)
      if (days > 0) {
        const cutoff =
          new Date(Date.now() - days * 86400000).toISOString().replace('T', ' ').substring(0, 19) +
          'Z'
        filterParts.push(
          '(last_contacted_at = "" || last_contacted_at = null || last_contacted_at <= {:cutoff})',
        )
        params.cutoff = cutoff
      }
    }

    const pbFilter = filterParts.join(' && ')

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

    let records = []
    try {
      records = $app.findRecordsByFilter('customers', pbFilter, '-created', 100000, 0, params)
    } catch (err) {
      return e.json(500, {
        error: 'Failed to query customers: ' + (err.message || 'unknown error'),
      })
    }

    const totalRecords = records.length
    const csvLines = []
    for (let i = 0; i < records.length; i++) {
      const r = records[i]
      const name = r.getString('name') || ''
      const phone = r.getString('phone') || ''
      const groupName = r.getString('whatsapp_group_name') || ''
      const city = r.getString('city') || ''
      const state = r.getString('state') || ''
      const source = r.getString('source') || ''
      const status = r.getString('status') || ''
      let created = ''
      try {
        const rawCreated = r.getString('created') || ''
        created = rawCreated.split(' ')[0] || ''
      } catch (_) {
        created = ''
      }

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
  },
  $apis.requireAuth(),
)
