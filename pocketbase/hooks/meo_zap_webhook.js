routerAdd('POST', '/backend/v1/meo-zap/webhook', (e) => {
  const body = e.requestInfo().body || {}
  const query = e.requestInfo().query || {}
  const headers = e.requestInfo().headers || {}

  const instanceId = body.instance_id || query['instance_id']
  const authHeader = headers['authorization'] || ''
  const token =
    body.token ||
    query['token'] ||
    (authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '')

  if (!instanceId && !token) {
    return e.badRequestError('Missing instance_id or token')
  }

  let filter = ''
  if (instanceId) {
    filter = `instance_id = '${instanceId}'`
  } else if (token) {
    filter = `token = '${token}'`
  }

  let config
  try {
    config = $app.findFirstRecordByFilter('whatsapp_configs', filter)
  } catch (_) {
    return e.unauthorizedError('Invalid instance_id or token')
  }

  const userId = config.get('user')
  const phone = body.phone
  const name = body.name || 'Lead WhatsApp'

  if (!phone) {
    return e.badRequestError('Missing phone number in payload')
  }

  let customer
  try {
    customer = $app.findFirstRecordByFilter(
      'customers',
      `phone = '${phone}' && manufacturer = '${userId}'`,
    )
    customer.set('name', name)
    customer.set('source', 'whatsapp')
    $app.save(customer)
  } catch (_) {
    const customersCol = $app.findCollectionByNameOrId('customers')
    customer = new Record(customersCol)
    customer.set('name', name)
    customer.set('phone', phone)
    customer.set('manufacturer', userId)
    customer.set('source', 'whatsapp')
    customer.set('status', 'new')
    $app.save(customer)
  }

  return e.json(200, {
    success: true,
    customerId: customer.id,
    message: 'Lead processed successfully',
  })
})
