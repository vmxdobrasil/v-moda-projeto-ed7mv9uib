// @deps zod@3.23.8
routerAdd(
  'POST',
  '/backend/v1/customers/bulk-import',
  (e) => {
    const body = e.requestInfo().body || {}
    const records = body.records || []
    const defaultSource = body.defaultSource || 'whatsapp_group'
    const duplicateAction = body.duplicate_action || 'ignore'
    const userId = e.auth && e.auth.id

    if (!Array.isArray(records)) {
      return e.badRequestError('Records must be an array')
    }

    const result = { success: 0, skipped: 0, updated: 0, error: 0, errorDetails: [] }
    const customersCol = $app.findCollectionByNameOrId('customers')

    $app.runInTransaction((txApp) => {
      for (let i = 0; i < records.length; i++) {
        const data = records[i]
        const phone = data.phone
        const rowIndex = i + 2

        if (!phone) {
          result.error++
          result.errorDetails.push({
            row_index: rowIndex,
            phone: '',
            error_message: 'Número de telefone ausente',
          })
          continue
        }

        let existingRecord = null
        try {
          existingRecord = txApp.findFirstRecordByData('customers', 'phone', phone)
        } catch (_) {}

        if (existingRecord) {
          if (duplicateAction === 'overwrite') {
            try {
              existingRecord.set('name', data.name || existingRecord.getString('name'))
              if (data.email) existingRecord.set('email', data.email)
              existingRecord.set('source', data.source || defaultSource)
              if (data.whatsapp_group_name)
                existingRecord.set('whatsapp_group_name', data.whatsapp_group_name)
              else if (data.caravan_name)
                existingRecord.set('whatsapp_group_name', data.caravan_name)
              if (data.origin_store_name)
                existingRecord.set('origin_store_name', data.origin_store_name)
              if (data.city) existingRecord.set('city', data.city)
              if (data.state) existingRecord.set('state', data.state)
              if (data.ranking_category)
                existingRecord.set('ranking_category', data.ranking_category)
              if (data.exclusivity_zone)
                existingRecord.set('exclusivity_zone', data.exclusivity_zone)
              if (data.notes) existingRecord.set('notes', data.notes)
              if (data.ddd) existingRecord.set('ddd', data.ddd)
              if (data.tags) {
                var tagsVal = data.tags
                if (typeof tagsVal === 'string') {
                  tagsVal = tagsVal
                    .split(',')
                    .map(function (t) {
                      return t.trim()
                    })
                    .filter(Boolean)
                }
                existingRecord.set('tags', tagsVal)
              }
              var validStatuses = [
                'new',
                'interested',
                'negotiating',
                'converted',
                'inactive',
                'proposal',
                'lead',
                'contact',
                'qualified',
                'negotiation',
                'closed',
              ]
              if (data.status && validStatuses.indexOf(data.status) !== -1) {
                existingRecord.set('status', data.status)
              }
              txApp.save(existingRecord)
              result.updated++
            } catch (err) {
              result.error++
              result.errorDetails.push({
                row_index: rowIndex,
                phone: phone,
                error_message: err.message || 'Erro ao atualizar',
              })
            }
          } else {
            result.skipped++
          }
          continue
        }

        try {
          const record = new Record(customersCol)
          record.set('phone', phone)
          record.set('name', data.name || 'Sem Nome')
          if (data.email) record.set('email', data.email)
          record.set('source', data.source || defaultSource)
          if (data.whatsapp_group_name) record.set('whatsapp_group_name', data.whatsapp_group_name)
          else if (data.caravan_name) record.set('whatsapp_group_name', data.caravan_name)
          if (data.origin_store_name) record.set('origin_store_name', data.origin_store_name)
          if (data.city) record.set('city', data.city)
          if (data.state) record.set('state', data.state)
          if (data.ranking_category) record.set('ranking_category', data.ranking_category)
          if (data.exclusivity_zone) record.set('exclusivity_zone', data.exclusivity_zone)
          if (data.notes) record.set('notes', data.notes)
          if (data.ddd) record.set('ddd', data.ddd)
          if (data.tags) {
            var tagsVal2 = data.tags
            if (typeof tagsVal2 === 'string') {
              tagsVal2 = tagsVal2
                .split(',')
                .map(function (t) {
                  return t.trim()
                })
                .filter(Boolean)
            }
            record.set('tags', tagsVal2)
          }
          if (data.manufacturer) record.set('manufacturer', data.manufacturer)
          if (data.affiliate_referrer) record.set('affiliate_referrer', data.affiliate_referrer)
          var validStatuses2 = [
            'new',
            'interested',
            'negotiating',
            'converted',
            'inactive',
            'proposal',
            'lead',
            'contact',
            'qualified',
            'negotiation',
            'closed',
          ]
          if (data.status && validStatuses2.indexOf(data.status) !== -1) {
            record.set('status', data.status)
          } else {
            record.set('status', 'new')
          }
          txApp.save(record)
          result.success++
        } catch (err) {
          result.error++
          result.errorDetails.push({
            row_index: rowIndex,
            phone: phone,
            error_message: err.message || 'Erro desconhecido ao salvar',
          })
        }
      }
    })

    return e.json(200, result)
  },
  $apis.requireAuth(),
)
