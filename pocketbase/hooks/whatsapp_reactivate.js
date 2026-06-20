routerAdd(
  'POST',
  '/backend/v1/whatsapp/reactivate',
  (e) => {
    const body = e.requestInfo().body
    const customerIds = body.customerIds || []
    const templateId = body.templateId

    if (!customerIds.length) return e.json(400, { error: 'No customers provided' })
    if (!templateId) return e.json(400, { error: 'No template provided' })

    let templateContent = ''
    try {
      const tpl = $app.findRecordById('whatsapp_templates', templateId)
      if (!tpl.get('is_active')) return e.json(400, { error: 'Template is not active' })
      templateContent = tpl.get('content')
    } catch (_) {
      return e.json(400, { error: 'Template not found' })
    }

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
    let skippedCount = 0

    // Prevent duplicate sends: Check if a message to this customer was queued recently
    const recentThreshold = new Date()
    recentThreshold.setMinutes(recentThreshold.getMinutes() - 60) // 1 hour ago

    for (const cid of customerIds) {
      try {
        const customer = $app.findRecordById('customers', cid)

        // Rate limiting check
        const lastContactedStr = customer.get('last_contacted_at')
        if (lastContactedStr) {
          const lastContacted = new Date(lastContactedStr)
          if (lastContacted > recentThreshold) {
            skippedCount++
            continue
          }
        }

        let content = templateContent
          .replace(/\{\{name\}\}/g, customer.get('name') || 'Cliente')
          .replace(/\{\{status\}\}/g, customer.get('status') || '')
          .replace(/\{\{city\}\}/g, customer.get('city') || '')

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

    return e.json(200, { success: true, count: sentCount, skipped: skippedCount })
  },
  $apis.requireAuth(),
)
