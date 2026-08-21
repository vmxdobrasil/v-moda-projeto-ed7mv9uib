routerAdd('POST', '/backend/v1/n8n-webhook', (e) => {
  const body = e.requestInfo().body || {}
  const rawPhone = body.phone !== undefined && body.phone !== null ? String(body.phone) : ''
  const rawName = body.name
  const messageText = body.message || ''
  const email = body.email || ''
  const source = body.source || 'n8n_whatsapp'

  // 1. Rate limiting interno: 50ms delay
  const start = Date.now()
  while (Date.now() - start < 50) {
    // busy wait sleep (Goja runtime)
  }

  // 2. Validação robusta do phone
  if (!rawPhone || !rawPhone.trim()) {
    return e.badRequestError("O campo 'phone' é obrigatório.")
  }

  let digits = rawPhone.replace(/\D/g, '')

  // Se tiver menos de 8 dígitos, rejeitar com 400
  if (digits.length < 8) {
    return e.badRequestError('Telefone inválido: menos de 8 dígitos.')
  }

  // Se não tiver DDD (menos de 10 dígitos após normalização), rejeitar com 400
  if (digits.length < 10) {
    return e.badRequestError('Telefone inválido: DDD ausente (mínimo 10 dígitos com DDD).')
  }

  // Normalização do telefone no padrão brasileiro
  let phoneNormalized = digits
  if (phoneNormalized.length === 10 || phoneNormalized.length === 11) {
    phoneNormalized = '55' + phoneNormalized
  }
  if (phoneNormalized.startsWith('55') && phoneNormalized.length === 12) {
    const ddd = phoneNormalized.substring(2, 4)
    const num = phoneNormalized.substring(4)
    phoneNormalized = '55' + ddd + '9' + num
  }

  // 3. Tratamento do campo 'name' e correção do bug "FALSE"
  let finalName = ''
  if (rawName !== null && rawName !== undefined) {
    const nameStr = String(rawName).trim()
    const nameUpper = nameStr.toUpperCase()
    if (
      nameUpper !== 'FALSE' &&
      nameUpper !== 'NULL' &&
      nameUpper !== 'UNDEFINED' &&
      nameStr !== ''
    ) {
      finalName = nameStr
    }
  }

  if (!finalName) {
    const last4 = phoneNormalized.length >= 4 ? phoneNormalized.slice(-4) : phoneNormalized
    finalName = 'Lead WhatsApp ' + last4
  }

  // 4. Buscar ou Criar Customer
  let customer
  let action = 'skipped'

  try {
    customer = $app.findFirstRecordByData('customers', 'phone', phoneNormalized)
    let updated = false

    const currentName = customer.getString('name')
    if (
      (!currentName ||
        currentName === 'Novo Lead' ||
        currentName.startsWith('Lead WhatsApp') ||
        currentName === 'Lead n8n') &&
      !finalName.startsWith('Lead WhatsApp')
    ) {
      customer.set('name', finalName)
      updated = true
    }

    if (email && !customer.getString('email')) {
      customer.set('email', email)
      updated = true
    }

    customer.set('last_contacted_at', new Date().toISOString())
    $app.save(customer)
    action = updated ? 'updated' : 'skipped'
  } catch (_) {
    const col = $app.findCollectionByNameOrId('customers')
    customer = new Record(col)
    customer.set('phone', phoneNormalized)
    customer.set('name', finalName)
    customer.set('status', 'new')
    customer.set('source', source)
    if (email) customer.set('email', email)
    customer.set('last_contacted_at', new Date().toISOString())
    $app.save(customer)
    action = 'created'
  }

  // 5. Criar Mensagem Inbound se houver messageText
  if (messageText) {
    try {
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
      msg.set('sender_id', phoneNormalized)
      msg.set('sender_name', customer.getString('name'))
      msg.set('content', messageText)
      msg.set('direction', 'inbound')
      msg.set('status', 'pending')
      $app.save(msg)
    } catch (msgErr) {
      $app.logger().error('Erro ao salvar mensagem no n8n webhook', 'error', msgErr.message)
    }
  }

  // 6. Log de progresso a cada 100 leads processados
  try {
    const totalCount = $app.countRecords('customers')
    if (totalCount > 0 && totalCount % 100 === 0) {
      const dddMask =
        phoneNormalized.length >= 4 ? phoneNormalized.substring(0, 4) : phoneNormalized
      console.log(
        '[n8n-webhook] Processados ' + totalCount + ' leads (último: +' + dddMask + '...)',
      )
    }
  } catch (_) {}

  // 7. Resposta aprimorada
  return e.json(200, {
    success: true,
    action: action,
    customer_id: customer.id,
    customer_name: customer.getString('name') || finalName,
    phone_normalized: phoneNormalized,
  })
})
