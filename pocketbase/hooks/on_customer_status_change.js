onRecordAfterUpdateSuccess((e) => {
  const newStatus = e.record.getString('status')
  const oldStatus = e.record.original().getString('status')

  if (!newStatus || newStatus === oldStatus) {
    return e.next()
  }

  const triggerMap = {
    interested: 'status_interested',
    negotiating: 'status_negotiating',
    converted: 'status_converted',
    inactive: 'status_inactive',
  }

  const trigger = triggerMap[newStatus]
  if (!trigger) return e.next()

  const manufacturerId = e.record.getString('manufacturer')
  if (!manufacturerId) return e.next()

  try {
    const templates = $app.findRecordsByFilter(
      'whatsapp_templates',
      `user = {:user} && trigger_event = {:trigger} && is_active = true`,
      '-created',
      1,
      0,
      {
        user: manufacturerId,
        trigger: trigger,
      },
    )

    if (!templates || templates.length === 0) return e.next()

    const template = templates[0]

    const configs = $app.findRecordsByFilter('whatsapp_configs', `user = {:user}`, '', 1, 0, {
      user: manufacturerId,
    })

    if (!configs || configs.length === 0) return e.next()

    const config = configs[0]
    const apiUrl = config.getString('api_url')
    const token = config.getString('token')
    const instanceId = config.getString('instance_id')

    if (!apiUrl) return e.next()

    let phone = e.record.getString('phone')
    if (!phone) return e.next()
    phone = phone.replace(/\D/g, '')
    if (!phone.startsWith('55')) phone = '55' + phone

    let content = template.getString('content')
    content = content.replace(/\{nome\}/g, e.record.getString('name') || 'Cliente')

    const payload = {
      number: phone,
      text: content,
    }

    const headers = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = 'Bearer ' + token
      headers['apikey'] = token
    }

    let finalUrl = apiUrl
    if (instanceId && finalUrl.includes('evolution')) {
      finalUrl = `${apiUrl}/message/sendText/${instanceId}`
    } else if (!finalUrl.endsWith('/send') && !finalUrl.includes('message/sendText')) {
      finalUrl = `${apiUrl}/send`
    }

    const res = $http.send({
      url: finalUrl,
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
      timeout: 15,
    })

    if (res.statusCode !== 200 && res.statusCode !== 201) {
      $app
        .logger()
        .error(
          'Failed to send WhatsApp status notification',
          'status',
          res.statusCode,
          'response',
          res.raw,
        )
    } else {
      $app
        .logger()
        .info(
          'WhatsApp status notification sent successfully',
          'customer',
          e.record.id,
          'status',
          newStatus,
        )
    }
  } catch (err) {
    $app.logger().error('Error in status change WhatsApp hook', 'error', err.message)
  }

  return e.next()
}, 'customers')
