routerAdd(
  'POST',
  '/backend/v1/leads/bulk-import',
  (e) => {
    const body = e.requestInfo().body || {}
    const collection = body.collection || ''
    const records = body.records || []
    const duplicateAction = body.duplicate_action || 'ignore'

    var validCollections = ['leads_venda', 'leads_fabricantes', 'leads_retailers']
    if (validCollections.indexOf(collection) === -1) {
      return e.badRequestError('Invalid collection: ' + collection)
    }

    if (!Array.isArray(records)) {
      return e.badRequestError('Records must be an array')
    }

    var result = { success: 0, skipped: 0, updated: 0, error: 0, errorDetails: [] }
    var col = $app.findCollectionByNameOrId(collection)

    var validStatuses = {
      leads_venda: ['pending', 'contacted', 'converted', 'closed'],
      leads_fabricantes: ['pending', 'contacted', 'approved', 'rejected'],
      leads_retailers: ['pending', 'contacted', 'approved', 'rejected'],
    }

    var validCategories = [
      'moda_feminina',
      'jeans',
      'moda_praia',
      'moda_geral',
      'moda_masculina',
      'moda_evangelica',
      'moda_country',
      'moda_infantil',
      'bijouterias_semijoias',
      'calcados',
      'moda_fitness',
      'plus_size',
    ]

    $app.runInTransaction(function (txApp) {
      for (var i = 0; i < records.length; i++) {
        var data = records[i]
        var rowIndex = i + 2

        var phoneField = collection === 'leads_fabricantes' ? 'whatsapp' : 'phone'
        var phoneVal = data[phoneField] || data.whatsapp || data.phone || ''
        var emailVal = data.email || ''

        var existing = null
        if (phoneVal) {
          try {
            existing = txApp.findFirstRecordByData(collection, phoneField, phoneVal)
          } catch (_) {}
        }
        if (!existing && emailVal) {
          try {
            existing = txApp.findFirstRecordByData(collection, 'email', emailVal)
          } catch (_) {}
        }

        if (existing) {
          if (duplicateAction === 'overwrite') {
            try {
              if (data.name && collection === 'leads_fabricantes') existing.set('name', data.name)
              if (data.category && collection === 'leads_fabricantes') {
                if (validCategories.indexOf(data.category) !== -1)
                  existing.set('category', data.category)
              }
              if (phoneVal) existing.set(phoneField, phoneVal)
              if (emailVal) existing.set('email', emailVal)
              if (data.store_name && collection === 'leads_retailers')
                existing.set('store_name', data.store_name)
              if (data.contact_name && collection === 'leads_retailers')
                existing.set('contact_name', data.contact_name)
              if (data.cnpj && collection === 'leads_retailers') existing.set('cnpj', data.cnpj)
              if (data.city) existing.set('city', data.city)
              if (data.state) existing.set('state', data.state)
              if (data.utm_source) existing.set('utm_source', data.utm_source)
              if (data.notes) existing.set('notes', data.notes)
              if (data.status && validStatuses[collection].indexOf(data.status) !== -1)
                existing.set('status', data.status)
              txApp.save(existing)
              result.updated++
            } catch (err) {
              result.error++
              result.errorDetails.push({
                row: rowIndex,
                error: err.message || 'Update failed',
              })
            }
          } else {
            result.skipped++
          }
          continue
        }

        try {
          var record = new Record(col)
          if (collection === 'leads_fabricantes') {
            record.set('name', data.name || 'Sem Nome')
            if (data.category && validCategories.indexOf(data.category) !== -1) {
              record.set('category', data.category)
            } else {
              record.set('category', 'moda_feminina')
            }
            record.set('whatsapp', phoneVal || '')
            if (emailVal) record.set('email', emailVal)
            if (data.utm_source) record.set('utm_source', data.utm_source)
          } else if (collection === 'leads_retailers') {
            record.set('store_name', data.store_name || 'Sem Nome')
            record.set('contact_name', data.contact_name || '')
            record.set('cnpj', data.cnpj || '')
            record.set('phone', phoneVal || '')
            if (emailVal) record.set('email', emailVal)
            if (data.city) record.set('city', data.city)
            if (data.state) record.set('state', data.state)
            if (data.utm_source) record.set('utm_source', data.utm_source)
          } else {
            if (data.message) record.set('message', data.message)
          }
          if (data.notes) record.set('notes', data.notes)
          if (data.status && validStatuses[collection].indexOf(data.status) !== -1) {
            record.set('status', data.status)
          } else {
            record.set('status', 'pending')
          }
          txApp.save(record)
          result.success++
        } catch (err) {
          result.error++
          result.errorDetails.push({
            row: rowIndex,
            error: err.message || 'Create failed',
          })
        }
      }
    })

    return e.json(200, result)
  },
  $apis.requireAuth(),
)
