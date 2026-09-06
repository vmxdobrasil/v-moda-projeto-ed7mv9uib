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

  // --- Automated Welcome Sequence com Rodízio Circular e Throttle Anti-banimento ---
  const welcomeSent = record.getBool('whatsapp_welcome_sent')
  const phone = record.getString('phone')

  if (!welcomeSent && phone && userId) {
    try {
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

        const sendResult = $whatsappRotator.sendWithRotation({
          userId: userId,
          phone: phone,
          message: msg,
        })

        if (sendResult.success) {
          const customerRecord = $app.findRecordById('customers', record.id)
          customerRecord.set('whatsapp_welcome_sent', true)
          $app.saveNoValidate(customerRecord)

          $app
            .logger()
            .info(
              'Boas-vindas WhatsApp enviada com sucesso via ' + sendResult.instance,
              'customer',
              record.id,
              'label',
              sendResult.label,
            )
        } else {
          $app
            .logger()
            .error('Falha ao enviar boas-vindas WhatsApp via rodízio', 'error', sendResult.error)
        }
      }
    } catch (err) {
      $app.logger().error('Welcome Sequence Error', 'err', String(err))
    }
  }

  e.next()
}, 'customers')
