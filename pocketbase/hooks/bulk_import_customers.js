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

    const existingRecords = $app.findRecordsByFilter(
      'customers',
      isAgent ? 'affiliate_referrer = {:userId}' : 'manufacturer = {:userId}',
      '',
      100000,
      0,
      { userId: user.id },
    )

    const phones = new Set()
    const emails = new Set()

    for (let i = 0; i < existingRecords.length; i++) {
      const rec = existingRecords[i]
      const p = rec.getString('phone')
      if (p) phones.add(p.replace(/\D/g, ''))
      const em = rec.getString('email')
      if (em) emails.add(em)
    }

    $app.runInTransaction((txApp) => {
      for (let i = 0; i < records.length; i++) {
        const row = records[i]

        let name = row.name || row.caravan_name || ''
        const rawPhone = row.phone || ''
        const phone = rawPhone ? rawPhone.toString().replace(/\D/g, '') : ''
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

        if (phones.has(phone) || (email && emails.has(email))) {
          skipped++
          continue
        }

        try {
          const record = new Record(customersCol)
          record.set('name', name)
          record.set('phone', rawPhone.toString())

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
          phones.add(phone)
          if (email) emails.add(email)
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
