routerAdd('POST', '/backend/v1/n8n-webhook', (e) => {
  const body = e.requestInfo().body || {}

  // 1. Extração do token Bearer / Custom / Query
  const queryToken = (e.request.url.query().get('token') || '').trim()
  const headerAuth = (e.request.header.get('Authorization') || '').trim()
  const headerCustom = (e.request.header.get('x-maestro-token') || '').trim()

  let providedToken = queryToken || headerCustom
  if (!providedToken && headerAuth.startsWith('Bearer ')) {
    providedToken = headerAuth.substring(7).trim()
  } else if (!providedToken && headerAuth) {
    providedToken = headerAuth
  }

  // 2. Verificar se a origem do payload é Maestro ou se token foi enviado
  // Origens Maestro: 'maestro', 'maestro_adapta', 'maestro-test', 'maestro_adapta_teste', etc.
  function isMaestroPayload() {
    if (providedToken) return true
    if (Array.isArray(body.leads)) {
      return body.leads.some((l) => {
        const s = String(l?.source || '')
          .toLowerCase()
          .trim()
        return s.startsWith('maestro')
      })
    }
    const singleSource = String(body.source || '')
      .toLowerCase()
      .trim()
    return singleSource.startsWith('maestro')
  }

  // Se o payload for do Maestro ou enviar credencial de token, validar estritamente
  if (isMaestroPayload()) {
    if (!providedToken) {
      return e.json(401, {
        success: false,
        error: 'Autenticação necessária. Envie o header Authorization: Bearer <token>',
      })
    }

    // Verificar se o token foi revogado
    try {
      const statusRec = $app.findFirstRecordByData('brand_settings', 'key', 'maestro_token_status')
      if ((statusRec.getString('value_text') || '').trim() === 'revoked') {
        return e.json(401, {
          success: false,
          error: 'Token do Maestro foi revogado. Gere uma nova credencial no painel AdminMaster.',
        })
      }
    } catch (_) {}

    // Buscar token configurado em brand_settings
    let configuredToken = ''
    try {
      const settingRec = $app.findFirstRecordByData(
        'brand_settings',
        'key',
        'maestro_integration_token',
      )
      configuredToken = (settingRec.getString('value_text') || '').trim()
    } catch (_) {}

    if (!configuredToken || providedToken !== configuredToken) {
      return e.json(401, {
        success: false,
        error: 'Token do Maestro inválido ou expirado.',
      })
    }
  }

  // Lista de fontes válidas conhecidas
  const validSources = [
    'maestro',
    'maestro_adapta',
    'whatsapp',
    'instagram',
    'email',
    'manual',
    'site',
    'whatsapp_group',
    'social_profile',
    'facebook',
    'n8n_whatsapp',
    'transferencia_vmoda',
  ]

  // Helper de normalização e processamento de um único lead
  function processSingleLead(item) {
    const rawPhone = item.phone !== undefined && item.phone !== null ? String(item.phone) : ''
    const rawName = item.nome !== undefined ? item.nome : item.name
    const messageText = item.mensagem !== undefined ? item.mensagem : item.message || ''
    const email = item.email || ''
    const rawDate = item.data !== undefined ? item.data : item.date || ''

    // Ajuste 1: Se source não vier ou for inválido, usar 'maestro' como padrão em vez de rejeitar
    let source = (item.source || '').trim()
    if (!source || !validSources.includes(source)) {
      // Se tiver prefixo maestro (ex: maestro-test, maestro_adapta_teste), normalizar para 'maestro'
      if (source.startsWith('maestro')) {
        source = 'maestro'
      } else if (!source) {
        source = 'maestro'
      } else {
        // Fallback seguro prescrito pelo usuário: use maestro como padrão em vez de rejeitar
        source = 'maestro'
      }
    }

    if (!rawPhone || !rawPhone.trim()) {
      return { success: false, error: "O campo 'phone' é obrigatório." }
    }

    let digits = rawPhone.replace(/\D/g, '')
    if (digits.length < 8) {
      return { success: false, error: 'Telefone inválido: menos de 8 dígitos.' }
    }
    if (digits.length < 10) {
      return {
        success: false,
        error: 'Telefone inválido: DDD ausente (mínimo 10 dígitos com DDD).',
      }
    }

    let phoneNormalized = digits
    if (phoneNormalized.length === 10 || phoneNormalized.length === 11) {
      phoneNormalized = '55' + phoneNormalized
    }
    if (phoneNormalized.startsWith('55') && phoneNormalized.length === 12) {
      const ddd = phoneNormalized.substring(2, 4)
      const num = phoneNormalized.substring(4)
      phoneNormalized = '55' + ddd + '9' + num
    }

    // Ajuste 2: Usar o campo nome quando enviado; não forçar "Lead WhatsApp ####" se nome existir
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

    let customer
    let action = 'skipped'

    try {
      customer = $app.findFirstRecordByData('customers', 'phone', phoneNormalized)
      let updated = false

      const currentName = customer.getString('name')
      // Se enviou um nome real válido, atualiza o lead
      if (finalName && !finalName.startsWith('Lead WhatsApp')) {
        if (currentName !== finalName) {
          customer.set('name', finalName)
          updated = true
        }
      } else if (
        (!currentName ||
          currentName === 'Novo Lead' ||
          currentName.startsWith('Lead WhatsApp') ||
          currentName === 'Lead n8n') &&
        !finalName.startsWith('Lead WhatsApp')
      ) {
        customer.set('name', finalName)
        updated = true
      }

      if (email && customer.getString('email') !== email) {
        customer.set('email', email)
        updated = true
      }

      // Salvar mensagem / observações e data quando vierem no payload
      if (messageText) {
        const existingNotes = customer.getString('notes') || ''
        const datePrefix = rawDate ? `[${rawDate}] ` : ''
        const newNotes = existingNotes
          ? `${existingNotes}\n${datePrefix}Mensagem: ${messageText}`
          : `${datePrefix}Mensagem: ${messageText}`
        customer.set('notes', newNotes)
        updated = true
      }

      customer.set('last_contacted_at', rawDate || new Date().toISOString())
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

      if (messageText) {
        const datePrefix = rawDate ? `[${rawDate}] ` : ''
        customer.set('notes', `${datePrefix}Mensagem: ${messageText}`)
      }

      customer.set('last_contacted_at', rawDate || new Date().toISOString())
      $app.save(customer)
      action = 'created'
    }

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
        $app.logger().error('Erro ao salvar mensagem no webhook', 'error', msgErr.message)
      }
    }

    return {
      success: true,
      action: action,
      customer_id: customer.id,
      customer_name: customer.getString('name') || finalName,
      phone_normalized: phoneNormalized,
    }
  }

  // Rate limiting suave de 20ms
  const start = Date.now()
  while (Date.now() - start < 20) {
    // busy wait sleep (Goja runtime)
  }

  // Suporte a lote de leads: { leads: [ { phone, name, source } ] }
  if (Array.isArray(body.leads)) {
    let createdCount = 0
    let updatedCount = 0
    let skippedCount = 0
    let failedCount = 0
    const processedResults = []

    for (let i = 0; i < body.leads.length; i++) {
      const res = processSingleLead(body.leads[i] || {})
      if (res.success) {
        if (res.action === 'created') createdCount++
        else if (res.action === 'updated') updatedCount++
        else skippedCount++
        processedResults.push({
          success: true,
          action: res.action,
          phone: res.phone_normalized,
          name: res.customer_name,
        })
      } else {
        failedCount++
        processedResults.push({ success: false, error: res.error })
      }
    }

    return e.json(200, {
      success: true,
      mode: 'batch',
      total: body.leads.length,
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      failed: failedCount,
      results: processedResults.slice(0, 10), // primeiros 10 para resumo
    })
  }

  // Caso unitário: { phone, name, source, message, email }
  const singleResult = processSingleLead(body)
  if (!singleResult.success) {
    return e.badRequestError(singleResult.error)
  }

  return e.json(200, {
    success: true,
    mode: 'single',
    action: singleResult.action,
    customer_id: singleResult.customer_id,
    customer_name: singleResult.customer_name,
    phone_normalized: singleResult.phone_normalized,
  })
})
