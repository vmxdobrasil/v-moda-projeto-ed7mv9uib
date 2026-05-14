routerAdd('POST', '/backend/v1/evolution_api/webhook', (e) => {
  const body = e.requestInfo().body || {}
  const event = body.event || body.type

  if (event !== 'messages.upsert') {
    return e.json(200, { received: true, ignored: true })
  }

  const messages = Array.isArray(body.data) ? body.data : body.data?.messages || [body.data]
  if (!messages || messages.length === 0) {
    return e.json(200, { received: true, ignored: true })
  }

  const instanceId = body.instance || 'default'

  let adminUser = null
  try {
    adminUser = $app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')
  } catch (_) {
    try {
      const users = $app.findRecordsByFilter('users', "role = 'admin'", '', 1, 0)
      if (users.length) adminUser = users[0]
    } catch (_) {}
  }

  let channelId = null
  try {
    const channels = $app.findRecordsByFilter(
      'channels',
      `name = '${instanceId}' && type = 'whatsapp'`,
      '',
      1,
      0,
    )
    if (channels.length > 0) {
      channelId = channels[0].id
    } else {
      const channelCol = $app.findCollectionByNameOrId('channels')
      const channel = new Record(channelCol)
      channel.set('name', instanceId)
      channel.set('type', 'whatsapp')
      channel.set('status', true)
      $app.save(channel)
      channelId = channel.id
    }
  } catch (err) {
    $app.logger().error('Error finding/creating channel', err)
  }

  messages.forEach((msgData) => {
    if (!msgData || !msgData.key) return
    if (msgData.key.fromMe) return

    const remoteJid = msgData.key.remoteJid || ''
    if (remoteJid.includes('@g.us')) return

    let phone = remoteJid.split('@')[0]
    const pushName = msgData.pushName || 'Desconhecido'

    let text = ''
    if (msgData.message?.conversation) {
      text = msgData.message.conversation
    } else if (msgData.message?.extendedTextMessage?.text) {
      text = msgData.message.extendedTextMessage.text
    } else {
      return
    }

    try {
      const customers = $app.findRecordsByFilter('customers', `phone = '${phone}'`, '', 1, 0)
      if (customers.length > 0) {
        if (customers[0].getString('name').startsWith('Lead ')) {
          customers[0].set('name', pushName)
          $app.save(customers[0])
        }
      } else {
        let digits = phone.replace(/\D/g, '')
        if (digits.length === 10 || digits.length === 11) {
          digits = '55' + digits
        }
        if (digits.startsWith('55') && digits.length === 12) {
          const ddd = digits.substring(2, 4)
          const num = digits.substring(4)
          digits = '55' + ddd + '9' + num
        }
        phone = digits

        const customerCol = $app.findCollectionByNameOrId('customers')
        const customer = new Record(customerCol)
        customer.set('name', pushName)
        customer.set('phone', phone)
        customer.set('status', 'new')
        customer.set('source', 'whatsapp')
        if (adminUser) customer.set('manufacturer', adminUser.id)
        $app.save(customer)
      }
    } catch (err) {
      $app.logger().error('Error finding/creating customer', err)
    }

    try {
      const messageCol = $app.findCollectionByNameOrId('messages')
      const messageRecord = new Record(messageCol)
      if (channelId) messageRecord.set('channel', channelId)
      messageRecord.set('sender_id', phone)
      messageRecord.set('sender_name', pushName)
      messageRecord.set('content', text)
      messageRecord.set('direction', 'inbound')
      messageRecord.set('status', 'pending')
      $app.save(messageRecord)
    } catch (err) {
      $app.logger().error('Error saving message', err)
    }
  })

  return e.json(200, { success: true })
})
