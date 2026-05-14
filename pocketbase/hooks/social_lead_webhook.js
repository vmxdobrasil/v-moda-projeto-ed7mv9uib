routerAdd('POST', '/backend/v1/social-leads/webhook', (e) => {
  const body = e.requestInfo().body || {}
  const phoneRaw = body.phone || ''
  const name = body.name || 'Lead Social'
  const instagram_handle = body.instagram_handle || ''
  const manufacturerId = body.manufacturer_id || ''

  if (!phoneRaw) {
    return e.badRequestError("O campo 'phone' é obrigatório.")
  }

  // Normalize phone correctly
  let phone = String(phoneRaw).replace(/\D/g, '')
  if (phone.length === 10 || phone.length === 11) {
    phone = '55' + phone
  }
  if (phone.startsWith('55') && phone.length === 12) {
    const ddd = phone.substring(2, 4)
    const num = phone.substring(4)
    phone = '55' + ddd + '9' + num
  }

  let customer
  try {
    customer = $app.findFirstRecordByData('customers', 'phone', phone)
    let changed = false
    if (instagram_handle && !customer.getString('instagram_handle')) {
      customer.set('instagram_handle', instagram_handle)
      changed = true
    }
    if (changed) {
      $app.save(customer)
    }
  } catch (_) {
    const col = $app.findCollectionByNameOrId('customers')
    customer = new Record(col)
    customer.set('phone', phone)
    customer.set('name', name)
    customer.set('status', 'new')
    customer.set('source', 'social_profile')

    if (instagram_handle) customer.set('instagram_handle', instagram_handle)
    if (manufacturerId) customer.set('manufacturer', manufacturerId)
    customer.set('last_contacted_at', new Date().toISOString())

    $app.save(customer)

    try {
      const logsCol = $app.findCollectionByNameOrId('import_logs')
      const logRecord = new Record(logsCol)
      if (manufacturerId) {
        logRecord.set('user', manufacturerId)
      } else {
        const admins = $app.findRecordsByFilter('users', "role='admin'", '', 1, 0)
        if (admins.length > 0) logRecord.set('user', admins[0].id)
      }
      logRecord.set('filename', 'Webhook Social Lead: ' + name)
      logRecord.set('status', 'success')
      logRecord.set('total_records', 1)
      logRecord.set('processed_records', 1)
      $app.save(logRecord)
    } catch (err) {
      $app.logger().error('Failed to write import_log for social lead', 'error', err.message)
    }
  }

  return e.json(200, { success: true, customerId: customer.id })
})
