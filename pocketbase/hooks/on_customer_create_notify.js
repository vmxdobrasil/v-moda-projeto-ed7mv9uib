onRecordCreate((e) => {
  const record = e.record
  let raw = record.getString('phone')
  if (raw) {
    let phone = raw.replace(/\D/g, '')
    if (phone.length === 10) {
      phone = '55' + phone.substring(0, 2) + '9' + phone.substring(2)
    } else if (phone.length === 11 && !phone.startsWith('55')) {
      phone = '55' + phone
    } else if (phone.length === 12 && phone.startsWith('55')) {
      phone = '55' + phone.substring(2, 4) + '9' + phone.substring(4)
    }
    record.set('phone', phone)
  }
  e.next()
}, 'customers')

onRecordUpdate((e) => {
  const record = e.record
  let raw = record.getString('phone')
  if (raw) {
    let phone = raw.replace(/\D/g, '')
    if (phone.length === 10) {
      phone = '55' + phone.substring(0, 2) + '9' + phone.substring(2)
    } else if (phone.length === 11 && !phone.startsWith('55')) {
      phone = '55' + phone
    } else if (phone.length === 12 && phone.startsWith('55')) {
      phone = '55' + phone.substring(2, 4) + '9' + phone.substring(4)
    }
    record.set('phone', phone)
  }
  e.next()
}, 'customers')

onRecordAfterCreateSuccess((e) => {
  const record = e.record
  const collection = $app.findCollectionByNameOrId('notifications')
  const notif = new Record(collection)

  const manufacturerId = record.getString('manufacturer')
  const affiliateId = record.getString('affiliate_referrer')
  let userId = manufacturerId || affiliateId

  if (!userId) {
    try {
      const admin = $app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      userId = admin.id
    } catch (_) {}
  }

  if (userId) {
    notif.set('user', userId)
    notif.set('title', 'Novo Lead Adicionado')
    notif.set(
      'message',
      `Um novo lead (${record.getString('name') || 'Sem Nome'}) foi adicionado à sua base de clientes.`,
    )
    notif.set('read', false)
    $app.saveNoValidate(notif)
  }

  // --- Automated Welcome Sequence with Load Balancer ---
  const welcomeSent = record.getBool('whatsapp_welcome_sent')
  const phone = record.getString('phone')

  if (!welcomeSent && phone && userId) {
    try {
      const configs = $app.findRecordsByFilter(
        'whatsapp_configs',
        'user = {:userId}',
        '-created',
        100,
        0,
        { userId },
      )

      if (configs.length > 0) {
        const config = configs[0]
        const apiUrl = config.getString('api_url').replace(/\/$/, '')
        const token = config.getString('token')

        let allInstances = []
        for (let i = 0; i < configs.length; i++) {
          const ids = configs[i]
            .getString('instance_id')
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s)
          allInstances = allInstances.concat(ids)
        }

        if (allInstances.length > 0) {
          let templateContent = null
          try {
            const templates = $app.findRecordsByFilter(
              'whatsapp_templates',
              'user = {:userId} && trigger_event = "welcome_message" && is_active = true',
              '-created',
              1,
              0,
              { userId },
            )
            if (templates.length > 0) {
              templateContent = templates[0].getString('content')
            }
          } catch (_) {}

          if (templateContent) {
            const name = record.getString('name') || 'Cliente'
            const msg = templateContent.replace(/\{\{name\}\}/g, name)

            let instancesToTry = allInstances.sort(() => Math.random() - 0.5)
            let success = false
            let lastError = null

            // Human Typing: Server-side sleep function varying randomly between 1000ms and 3000ms
            const delayMs = Math.floor(Math.random() * 2000) + 1000
            const start = Date.now()
            while (Date.now() - start < delayMs) {
              // busy wait for sleep
            }

            for (const inst of instancesToTry) {
              try {
                const res = $http.send({
                  url: `${apiUrl}/message/sendText/${inst}`,
                  method: 'POST',
                  headers: {
                    apikey: token,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    number: phone,
                    options: { delay: delayMs, presence: 'composing' },
                    textMessage: { text: msg },
                  }),
                  timeout: 10,
                })

                if (res.statusCode === 200 || res.statusCode === 201) {
                  success = true
                  break
                } else if (
                  res.statusCode === 404 ||
                  res.statusCode === 428 ||
                  res.statusCode === 401
                ) {
                  lastError = res.statusCode
                } else {
                  lastError = res.statusCode
                  break
                }
              } catch (err) {
                lastError = String(err)
              }
            }

            if (success) {
              const customerRecord = $app.findRecordById('customers', record.id)
              customerRecord.set('whatsapp_welcome_sent', true)
              $app.saveNoValidate(customerRecord)
            } else {
              $app
                .logger()
                .error('Failed to send welcome message after trying instances', 'error', lastError)
            }
          }
        }
      }
    } catch (err) {
      $app.logger().error('Welcome Sequence Error', 'err', String(err))
    }
  }

  e.next()
}, 'customers')
