routerAdd(
  'POST',
  '/backend/v1/export-customers-csv',
  (e) => {
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var role = e.auth ? e.auth.get('role') : ''
    var email = e.auth ? e.auth.get('email') : ''
    var isAdmin = role === 'admin' || email === 'valterpmendonca@gmail.com'

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

    function stringToUtf8Bytes(str) {
      var bytes = []
      for (var i = 0; i < str.length; i++) {
        var charCode = str.charCodeAt(i)
        if (charCode < 0x80) {
          bytes.push(charCode)
        } else if (charCode < 0x800) {
          bytes.push(0xc0 | (charCode >> 6))
          bytes.push(0x80 | (charCode & 0x3f))
        } else {
          bytes.push(0xe0 | (charCode >> 12))
          bytes.push(0x80 | ((charCode >> 6) & 0x3f))
          bytes.push(0x80 | (charCode & 0x3f))
        }
      }
      return new Uint8Array(bytes)
    }

    function pad3(n) {
      var s = String(n)
      while (s.length < 3) s = '0' + s
      return s
    }

    var sql = 'SELECT phone, whatsapp_group_name, city, state, ddd FROM customers'
    var params = {}
    if (!isAdmin) {
      sql += ' WHERE manufacturer = {:userId}'
      params = { userId: userId }
    }

    var rows = []
    $app.db().newQuery(sql).bind(params).all(rows)

    if (rows.length === 0) {
      return e.json(400, { error: 'Nenhum cliente encontrado para exportação.' })
    }

    var batchSize = 500
    var totalParts = Math.ceil(rows.length / batchSize)
    var exportsArr = []
    var exportsCol = $app.findCollectionByNameOrId('exports')

    for (var part = 0; part < totalParts; part++) {
      var start = part * batchSize
      var end = Math.min(start + batchSize, rows.length)

      var csv = '\uFEFFphone,whatsapp_group_name,city,state\n'
      for (var i = start; i < end; i++) {
        var row = rows[i]
        var phone = normalizePhone(row.phone)
        var groupName = row.whatsapp_group_name || ''
        var city = row.city || ''
        var ddd = extractDdd(row.phone, row.ddd)
        var state = row.state || dddToUf[ddd] || ''
        csv +=
          csvEscape(phone) +
          ',' +
          csvEscape(groupName) +
          ',' +
          csvEscape(city) +
          ',' +
          csvEscape(state) +
          '\n'
      }

      var partNum = part + 1
      var filename = 'leads_export_' + partNum + '_de_' + totalParts + '.csv'
      var fileBytes = stringToUtf8Bytes(csv)
      var file = $filesystem.fileFromBytes(fileBytes, filename)

      var record = new Record(exportsCol)
      record.set('user', userId)
      record.set('filename', filename)
      record.set('file', file)
      record.set('record_count', end - start)
      record.set('part_number', partNum)
      record.set('total_parts', totalParts)
      $app.save(record)

      exportsArr.push({
        id: record.id,
        filename: filename,
        file: record.getString('file'),
        record_count: end - start,
        part_number: partNum,
        total_parts: totalParts,
      })
    }

    return e.json(200, {
      exports: exportsArr,
      total_parts: totalParts,
      total_records: rows.length,
    })
  },
  $apis.requireAuth(),
)
