routerAdd(
  'POST',
  '/backend/v1/customers/bulk-import',
  (e) => {
    const body = e.requestInfo().body
    const records = body.records || []

    if (!Array.isArray(records)) {
      throw new BadRequestError('records must be an array')
    }

    const user = e.auth
    if (!user) {
      throw new UnauthorizedError('Authentication required')
    }

    const role = user.getString('role')
    const isAffiliate = role === 'affiliate'

    const customersCol = $app.findCollectionByNameOrId('customers')

    let success = 0
    let skipped = 0
    let errorCount = 0

    const existingRecords = $app.findRecordsByFilter(
      'customers',
      isAffiliate ? 'affiliate_referrer = {:userId}' : 'manufacturer = {:userId}',
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
        const name = row.name
        const rawPhone = row.phone
        const phone = rawPhone ? rawPhone.replace(/\D/g, '') : ''
        const email = row.email

        if (!name || !phone) {
          errorCount++
          continue
        }

        if (phones.has(phone) || (email && emails.has(email))) {
          skipped++
          continue
        }

        try {
          const record = new Record(customersCol)
          record.set('name', name)
          record.set('phone', rawPhone)
          if (email) {
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              record.set('email', email)
            } else {
              throw new Error('Invalid email format')
            }
          }
          record.set('source', row.source || 'manual')
          record.set('exclusivity_zone', row.exclusivity_zone || '')
          record.set('ranking_category', row.ranking_category || '')
          record.set('status', 'new')

          if (isAffiliate) {
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
        }
      }
    })

    return e.json(200, { success, skipped, error: errorCount })
  },
  $apis.requireAuth(),
)
