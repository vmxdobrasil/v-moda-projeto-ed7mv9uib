routerAdd(
  'POST',
  '/backend/v1/whatsapp/reactivate',
  (e) => {
    const body = e.requestInfo().body
    const customerIds = body.customerIds || []
    if (!customerIds.length) return e.json(400, { error: 'No customers provided' })

    let templateContent =
      'Olá {{name}}, notamos que você ainda não aproveitou seu bônus de 80% na Revista MODA ATUAL. Vamos retomar seu crescimento? Clique aqui: https://v-moda-project-344c0.goskip.app/revista'
    try {
      const tpl = $app.findFirstRecordByFilter(
        'whatsapp_templates',
        "trigger_event = 'reactivation_campaign' && is_active = true",
      )
      templateContent = tpl.get('content')
    } catch (_) {}

    let channelId = ''
    try {
      const channel = $app.findFirstRecordByFilter('channels', "type = 'whatsapp'")
      channelId = channel.id
    } catch (_) {
      const channelsCol = $app.findCollectionByNameOrId('channels')
      const newChannel = new Record(channelsCol)
      newChannel.set('name', 'WhatsApp Padrão')
      newChannel.set('type', 'whatsapp')
      newChannel.set('status', true)
      $app.save(newChannel)
      channelId = newChannel.id
    }

    const messagesCol = $app.findCollectionByNameOrId('messages')

    let sentCount = 0
    for (const cid of customerIds) {
      try {
        const customer = $app.findRecordById('customers', cid)
        let content = templateContent
          .replace(/\{\{name\}\}/g, customer.get('name') || 'Cliente')
          .replace(/\{\{benefit_link\}\}/g, 'https://v-moda-project-344c0.goskip.app/revista')

        const msg = new Record(messagesCol)
        msg.set('channel', channelId)
        msg.set('sender_id', customer.get('phone') || customer.get('email') || customer.id)
        msg.set('sender_name', customer.get('name'))
        msg.set('content', content)
        msg.set('direction', 'outbound')
        msg.set('status', 'pending')
        $app.save(msg)

        customer.set('last_contacted_at', new Date().toISOString())
        $app.save(customer)

        sentCount++
      } catch (err) {
        console.log('Error processing customer reactivation', cid, err)
      }
    }

    return e.json(200, { success: true, count: sentCount })
  },
  $apis.requireAuth(),
)
