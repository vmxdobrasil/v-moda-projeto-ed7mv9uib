routerAdd(
  'POST',
  '/backend/v1/export-customers-csv',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var role = e.auth ? e.auth.get('role') : ''
    var email = e.auth ? e.auth.get('email') : ''
    var isAdmin = role === 'admin' || email === 'valterpmendonca@gmail.com'

    var page = Math.max(1, parseInt(body.page || '1', 10) || 1)
    var perPage = Math.min(500, Math.max(1, parseInt(body.perPage || '500', 10) || 500))
    var offset = (page - 1) * perPage

    var dddToUf = {
      11: 'SP',
      12: 'SP',
      13: 'SP',
      14: 'SP',
      15: 'SP',
      16: 'SP',
      17: 'SP',
      18: 'SP',
      19: 'SP',
      21: 'RJ',
      22: 'RJ',
      24: 'RJ',
      27: 'ES',
      28: 'ES',
      31: 'MG',
      32: 'MG',
      33: 'MG',
      34: 'MG',
      35: 'MG',
      37: 'MG',
      38: 'MG',
      41: 'PR',
      42: 'PR',
      43: 'PR',
      44: 'PR',
      45: 'PR',
      46: 'PR',
      47: 'SC',
      48: 'SC',
      49: 'SC',
      51: 'RS',
      53: 'RS',
      54: 'RS',
      55: 'RS',
      61: 'DF',
      62: 'GO',
      64: 'GO',
      63: 'TO',
      65: 'MT',
      66: 'MT',
      67: 'MS',
      68: 'AC',
      69: 'RO',
      71: 'BA',
      73: 'BA',
      74: 'BA',
      75: 'BA',
      77: 'BA',
      79: 'SE',
      81: 'PE',
      87: 'PE',
      82: 'AL',
      83: 'PB',
      84: 'RN',
      85: 'CE',
      88: 'CE',
      86: 'PI',
      89: 'PI',
      91: 'PA',
      93: 'PA',
      94: 'PA',
      92: 'AM',
      97: 'AM',
      95: 'RR',
      96: 'AP',
      98: 'MA',
      99: 'MA',
    }

    function normalizePhone(phone) {
      var digits = (phone || '').replace(/\D/g, '')
      if (digits.length > 11 && digits.substring(0, 2) === '55') {
        digits = digits.substring(2)
      }
      if (digits.length === 10) {
        digits = digits.substring(0, 2) + '9' + digits.substring(2)
      }
      if (digits.length < 10) return ''
      return '55' + digits
    }

    function extractDdd(phone, ddd) {
      if (ddd && ddd.length === 2) return ddd
      var digits = (phone || '').replace(/\D/g, '')
      if (digits.length > 11 && digits.substring(0, 2) === '55') {
        digits = digits.substring(2)
      }
      if (digits.length >= 2) return digits.substring(0, 2)
      return ''
    }

    function csvEscape(value) {
      if (value == null) return ''
      var str = String(value)
      if (
        str.indexOf(',') !== -1 ||
        str.indexOf('"') !== -1 ||
        str.indexOf('\n') !== -1 ||
        str.indexOf('\r') !== -1
      ) {
        return '"' + str.replace(/"/g, '""') + '"'
      }
      return str
    }

    var conditions = []
    var params = {}

    if (!isAdmin) {
      conditions.push('manufacturer = {:userId}')
      params.userId = userId
    }

    if (body.search && typeof body.search === 'string' && body.search.trim()) {
      params.search = '%' + body.search.trim() + '%'
      conditions.push('(name LIKE {:search} OR phone LIKE {:search})')
    }

    if (body.status && body.status !== 'all') {
      params.status = body.status
      conditions.push('status = {:status}')
    }

    if (body.shippingMethod && body.shippingMethod !== 'all') {
      params.shippingMethod = body.shippingMethod
      conditions.push('shipping_method = {:shippingMethod}')
    }

    if (body.categoryId && body.categoryId !== 'all') {
      params.categoryId = body.categoryId
      conditions.push('category_id = {:categoryId}')
    }

    if (body.inactivityDays && body.inactivityDays !== 'all') {
      var days = parseInt(String(body.inactivityDays), 10)
      if (days > 0) {
        var cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        var cutoffStr = cutoff.toISOString().split('T')[0]
        params.cutoffDate = cutoffStr
        conditions.push(
          "(last_contacted_at < {:cutoffDate} OR last_contacted_at = '' OR last_contacted_at IS NULL)",
        )
      }
    }

    var whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''

    var countRows = []
    $app
      .db()
      .newQuery('SELECT COUNT(*) as total FROM customers' + whereClause)
      .bind(params)
      .all(countRows)
    var totalRecords = countRows.length > 0 ? countRows[0].total : 0

    if (totalRecords === 0) {
      return e.json(200, {
        csvChunk: '',
        totalRecords: 0,
        page: page,
        totalPages: 0,
        hasMore: false,
      })
    }

    var dataSql =
      'SELECT phone, whatsapp_group_name, city, state, ddd FROM customers' +
      whereClause +
      ' ORDER BY created DESC LIMIT ' +
      perPage +
      ' OFFSET ' +
      offset
    var rows = []
    $app.db().newQuery(dataSql).bind(params).all(rows)

    var csvLines = []
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i]
      var phone = normalizePhone(row.phone)
      var groupName = row.whatsapp_group_name || ''
      var city = row.city || ''
      var ddd = extractDdd(row.phone, row.ddd)
      var state = row.state || dddToUf[ddd] || ''
      csvLines.push(
        csvEscape(phone) +
          ',' +
          csvEscape(groupName) +
          ',' +
          csvEscape(city) +
          ',' +
          csvEscape(state),
      )
    }

    var totalPages = Math.ceil(totalRecords / perPage)

    return e.json(200, {
      csvChunk: csvLines.length > 0 ? csvLines.join('\n') + '\n' : '',
      totalRecords: totalRecords,
      page: page,
      totalPages: totalPages,
      hasMore: page < totalPages,
    })
  },
  $apis.requireAuth(),
)
