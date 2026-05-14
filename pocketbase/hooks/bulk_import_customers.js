routerAdd(
  'POST',
  '/backend/v1/customers/bulk-import',
  (e) => {
    const body = e.requestInfo().body
    const records = body.records || []
    const defaultSource = body.defaultSource || 'manual'

    if (!Array.isArray(records)) {
      throw new BadRequestError('records must be an array')
    }

    const user = e.auth
    if (!user) {
      throw new UnauthorizedError('Authentication required')
    }

    const role = user.getString('role')
    if (role === 'affiliate') {
      throw new ForbiddenError('Influenciadores não têm permissão para importar clientes em massa.')
    }

    const isAgent = role === 'agent'

    const customersCol = $app.findCollectionByNameOrId('customers')

    let success = 0
    let skipped = 0
    let errorCount = 0
    const errorDetails = []

    const batchPhones = new Set()
    for (let i = 0; i < records.length; i++) {
      let rawPhone = records[i].phone || ''
      let phone = rawPhone.toString().replace(/\D/g, '')
      if (phone.length === 10) {
        phone = '55' + phone.substring(0, 2) + '9' + phone.substring(2)
      } else if (phone.length === 11 && !phone.startsWith('55')) {
        phone = '55' + phone
      } else if (phone.length === 12 && phone.startsWith('55')) {
        phone = '55' + phone.substring(2, 4) + '9' + phone.substring(4)
      }
      if (phone) batchPhones.add(phone)
    }

    const existingRecordsMap = new Map()
    if (batchPhones.size > 0) {
      const phoneArr = Array.from(batchPhones)
      // Break into chunks of 500 to avoid SQLite IN clause limits just in case
      for (let c = 0; c < phoneArr.length; c += 500) {
        const chunk = phoneArr.slice(c, c + 500)
        const placeholders = chunk.map((_, idx) => `{:p${idx}}`).join(',')
        const filter = isAgent
          ? `affiliate_referrer = {:userId} && phone IN (${placeholders})`
          : `manufacturer = {:userId} && phone IN (${placeholders})`

        const params = { userId: user.id }
        chunk.forEach((p, idx) => {
          params[`p${idx}`] = p
        })

        const existingRecords = $app.findRecordsByFilter('customers', filter, '', 1000, 0, params)

        for (let i = 0; i < existingRecords.length; i++) {
          const p = existingRecords[i].getString('phone')
          if (p) existingRecordsMap.set(p, existingRecords[i])
        }
      }
    }

    $app.runInTransaction((txApp) => {
      for (let i = 0; i < records.length; i++) {
        const row = records[i]

        let name = row.name || row.caravan_name || row.origin_store_name || ''
        const rawPhone = row.phone || ''
        let phone = rawPhone ? rawPhone.toString().replace(/\D/g, '') : ''

        if (phone.length === 10) {
          phone = '55' + phone.substring(0, 2) + '9' + phone.substring(2)
        } else if (phone.length === 11 && !phone.startsWith('55')) {
          phone = '55' + phone
        } else if (phone.length === 12 && phone.startsWith('55')) {
          phone = '55' + phone.substring(2, 4) + '9' + phone.substring(4)
        }

        const email = row.email

        if (!name && phone) {
          name = `Lead ${phone}`
        }

        if (!name || !phone) {
          errorCount++
          errorDetails.push({
            index: i,
            reason: 'Telefone é obrigatório e nenhum nome foi fornecido ou deduzido',
          })
          continue
        }

        let isUpdate = false
        let record = null

        if (existingRecordsMap.has(phone)) {
          record = existingRecordsMap.get(phone)
          isUpdate = true
        } else {
          record = new Record(customersCol)
          record.set('status', 'new')
          if (isAgent) {
            record.set('affiliate_referrer', user.id)
          } else {
            record.set('manufacturer', user.id)
          }
        }

        try {
          if (!isUpdate || (name && name !== `Lead ${phone}`)) {
            record.set('name', name)
          }
          record.set('phone', phone)

          if (email) {
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              record.set('email', email)
            } else if (!isUpdate) {
              throw new Error('Formato de e-mail inválido')
            }
          }

          if (row.source && !isUpdate) record.set('source', row.source)
          else if (!isUpdate) record.set('source', defaultSource)

          if (row.exclusivity_zone) record.set('exclusivity_zone', row.exclusivity_zone)
          if (row.ranking_category) record.set('ranking_category', row.ranking_category)
          if (row.caravan_name) record.set('caravan_name', row.caravan_name)
          if (row.origin_store_name) record.set('origin_store_name', row.origin_store_name)
          if (row.city) record.set('city', row.city)
          if (row.state) record.set('state', row.state)
          if (row.notes) {
            const currentNotes = record.getString('notes')
            record.set('notes', currentNotes ? `${currentNotes}\n${row.notes}` : row.notes)
          }

          txApp.save(record)
          existingRecordsMap.set(phone, record)

          if (isUpdate) {
            skipped++ // We count updates as skipped/merged for the final report to match user expectations
          } else {
            success++
          }
        } catch (err) {
          errorCount++
          errorDetails.push({
            index: i,
            reason: err.message || 'Erro ao salvar registro no banco de dados',
          })
        }
      }
    })

    return e.json(200, { success, skipped, error: errorCount, errorDetails })
  },
  $apis.requireAuth(),
)
