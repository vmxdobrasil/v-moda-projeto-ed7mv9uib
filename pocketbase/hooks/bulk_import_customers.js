// @deps zod@3.23.8
routerAdd(
  'POST',
  '/backend/v1/customers/bulk-import',
  (e) => {
    const body = e.requestInfo().body || {}
    const records = body.records || []
    const defaultSource = body.defaultSource || 'whatsapp_group'

    if (!Array.isArray(records)) {
      return e.badRequestError('Records must be an array')
    }

    const result = { success: 0, skipped: 0, error: 0, errorDetails: [] }
    const customersCol = $app.findCollectionByNameOrId('customers')

    $app.runInTransaction((txApp) => {
      for (let i = 0; i < records.length; i++) {
        const data = records[i]
        const phone = data.phone

        if (!phone) {
          result.error++
          result.errorDetails.push({ index: i, reason: 'Número de telefone ausente' })
          continue
        }

        try {
          txApp.findFirstRecordByData('customers', 'phone', phone)
          // Se já existe, ignora para evitar duplicação
          result.skipped++
          continue
        } catch (_) {
          // Não existe, pode criar
        }

        try {
          const record = new Record(customersCol)
          record.set('phone', phone)
          record.set('name', data.name || 'Sem Nome')

          if (data.email) record.set('email', data.email)
          record.set('source', data.source || defaultSource)

          if (data.whatsapp_group_name) {
            record.set('whatsapp_group_name', data.whatsapp_group_name)
          } else if (data.caravan_name) {
            record.set('whatsapp_group_name', data.caravan_name)
          }

          if (data.origin_store_name) record.set('origin_store_name', data.origin_store_name)
          if (data.city) record.set('city', data.city)
          if (data.state) record.set('state', data.state)
          if (data.ranking_category) record.set('ranking_category', data.ranking_category)
          if (data.exclusivity_zone) record.set('exclusivity_zone', data.exclusivity_zone)
          if (data.notes) record.set('notes', data.notes)
          if (data.ddd) record.set('ddd', data.ddd)
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
            record.set('tags', tagsVal)
          }
          if (data.manufacturer) record.set('manufacturer', data.manufacturer)
          if (data.affiliate_referrer) record.set('affiliate_referrer', data.affiliate_referrer)

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
            record.set('status', data.status)
          } else {
            record.set('status', 'new')
          }

          txApp.save(record)
          result.success++
        } catch (err) {
          result.error++
          result.errorDetails.push({
            index: i,
            reason: err.message || 'Erro desconhecido ao salvar',
          })
        }
      }
    })

    return e.json(200, result)
  },
  $apis.requireAuth(),
)
