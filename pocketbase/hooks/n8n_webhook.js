routerAdd('POST', '/backend/v1/n8n-webhook', (e) => {
  const body = e.requestInfo().body
  const phone = body.phone || ''
  const name = body.name || 'Lead n8n'
  const messageText = body.message || ''
  const email = body.email || ''
  const source = body.source || 'whatsapp'

  if (!phone) {
    return e.badRequestError("O campo 'phone' é obrigatório.")
  }

  let customer
  try {
    customer = $app.findFirstRecordByData('customers', 'phone', phone)
    if (name && customer.getString('name') === 'Novo Lead') {
      customer.set('name', name)
    }
    if (email) customer.set('email', email)
    customer.set('last_contacted_at', new Date().toISOString())
    $app.save(customer)
  } catch (_) {
    const col = $app.findCollectionByNameOrId('customers')
    customer = new Record(col)
    customer.set('phone', phone)
    customer.set('name', name)
    customer.set('status', 'new')
    customer.set('source', source)
    if (email) customer.set('email', email)
    customer.set('last_contacted_at', new Date().toISOString())
    $app.save(customer)
  }

  if (messageText) {
    const msgCol = $app.findCollectionByNameOrId('messages')
    const msg = new Record(msgCol)

    let channel
    try {
      channel = $app.findFirstRecordByData('channels', 'type', 'whatsapp')
    } catch (_) {
      const chCol = $app.findCollectionByNameOrId('channels')
      channel = new Record(chCol)
      channel.set('name', 'WhatsApp')
      channel.set('type', 'whatsapp')
      channel.set('status', true)
      $app.save(channel)
    }

    msg.set('channel', channel.id)
    msg.set('sender_id', phone)
    msg.set('sender_name', customer.getString('name'))
    msg.set('content', messageText)
    msg.set('direction', 'inbound')
    msg.set('status', 'pending')
    $app.save(msg)
  }

  return e.json(200, { success: true, customerId: customer.id })
})
