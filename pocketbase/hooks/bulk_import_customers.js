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

    const existingPhones = new Set()
    if (batchPhones.size > 0) {
      const phoneArr = Array.from(batchPhones)
      const placeholders = phoneArr.map((_, idx) => `{:p${idx}}`).join(',')
      const filter = isAgent
        ? `affiliate_referrer = {:userId} && phone IN (${placeholders})`
        : `manufacturer = {:userId} && phone IN (${placeholders})`

      const params = { userId: user.id }
      phoneArr.forEach((p, idx) => {
        params[`p${idx}`] = p
      })

      const existingRecords = $app.findRecordsByFilter('customers', filter, '', 1000, 0, params)

      for (let i = 0; i < existingRecords.length; i++) {
        const p = existingRecords[i].getString('phone')
        if (p) existingPhones.add(p)
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

        if (existingPhones.has(phone)) {
          skipped++
          continue
        }

        try {
          const record = new Record(customersCol)
          record.set('name', name)
          record.set('phone', phone)

          if (email) {
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              record.set('email', email)
            } else {
              throw new Error('Formato de e-mail inválido')
            }
          }

          record.set('source', row.source || defaultSource)
          if (row.exclusivity_zone) record.set('exclusivity_zone', row.exclusivity_zone)
          if (row.ranking_category) record.set('ranking_category', row.ranking_category)
          if (row.caravan_name) record.set('caravan_name', row.caravan_name)
          if (row.origin_store_name) record.set('origin_store_name', row.origin_store_name)
          if (row.city) record.set('city', row.city)
          if (row.state) record.set('state', row.state)
          if (row.notes) record.set('notes', row.notes)

          record.set('status', 'new')

          if (isAgent) {
            record.set('affiliate_referrer', user.id)
          } else {
            record.set('manufacturer', user.id)
          }

          txApp.save(record)
          existingPhones.add(phone)
          success++
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
