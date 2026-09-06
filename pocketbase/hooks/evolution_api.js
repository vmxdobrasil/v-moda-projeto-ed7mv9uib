routerAdd(
  'GET',
  '/backend/v1/evolution_api/status',
  (e) => {
    const instanceQuery = e.request.url.query().get('instance')

    let apiUrl =
      $secrets.get('EVOLUTION_API_URL') || 'https://evolution-evolution.6xxwvj.easypanel.host'
    let token = $secrets.get('EVOLUTION_API_KEY') || '7i5UsFq1MM8pEbt8NqCVDPglfY8v9LTd'
    let targetInstance = instanceQuery || 'vmoda'

    try {
      const configs = $app.findRecordsByFilter(
        'whatsapp_configs',
        'user = {:userId}',
        '-created',
        100,
        0,
        { userId: e.auth.id },
      )
      if (configs && configs.length > 0) {
        const config = configs[0]
        if (config.getString('api_url')) apiUrl = config.getString('api_url')
        if (config.getString('token')) token = config.getString('token')
        if (!instanceQuery && config.getString('instance_id')) {
          targetInstance = config.getString('instance_id').split(',')[0].trim()
        }
      }
    } catch (_) {}

    if (!apiUrl || !token || !targetInstance) {
      return e.json(200, { state: 'disconnected', error: 'Configuração incompleta' })
    }

    try {
      const url = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const res = $http.send({
        url: `${url}/instance/connectionState/${targetInstance}`,
        method: 'GET',
        headers: { apikey: token },
        timeout: 15,
      })

      if (res.statusCode === 200) {
        return e.json(200, res.json)
      } else if (res.statusCode === 401 || res.statusCode === 403) {
        return e.json(200, {
          state: 'auth_error',
          error: 'Erro de Autenticação: Chave de API inválida',
        })
      } else if (res.statusCode === 404) {
        return e.json(200, { state: 'disconnected', error: 'Instância não encontrada' })
      } else {
        $app
          .logger()
          .error(
            'Evolution API Status Error Response',
            'status',
            res.statusCode,
            'body',
            String(res.body),
          )
        return e.json(200, {
          state: 'offline',
          error: `Serviço Indisponível (${res.statusCode})`,
        })
      }
    } catch (err) {
      $app.logger().error('Evolution API Status Error', 'err', String(err))
      return e.json(200, {
        state: 'offline',
        error: 'Serviço Indisponível (Timeout ou Falha de Rede)',
      })
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/evolution_api/connect',
  (e) => {
    let apiUrl =
      $secrets.get('EVOLUTION_API_URL') || 'https://evolution-evolution.6xxwvj.easypanel.host'
    let token = $secrets.get('EVOLUTION_API_KEY') || '7i5UsFq1MM8pEbt8NqCVDPglfY8v9LTd'
    const instanceQuery = e.request.url.query().get('instance')
    let targetInstance = instanceQuery || 'vmoda'

    try {
      const configs = $app.findRecordsByFilter(
        'whatsapp_configs',
        'user = {:userId}',
        '-created',
        100,
        0,
        { userId: e.auth.id },
      )
      if (configs && configs.length > 0) {
        let matched = null
        if (instanceQuery) {
          matched = configs.find((c) => {
            const ids = (c.getString('instance_id') || '').split(',').map((s) => s.trim())
            return ids.includes(instanceQuery)
          })
        }
        const config = matched || configs[0]
        if (config.getString('api_url')) apiUrl = config.getString('api_url')
        if (config.getString('token')) token = config.getString('token')
        if (!instanceQuery && config.getString('instance_id')) {
          targetInstance = config.getString('instance_id').split(',')[0].trim()
        }
      }
    } catch (_) {}

    try {
      const url = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const res = $http.send({
        url: `${url}/instance/connect/${targetInstance}`,
        method: 'GET',
        headers: { apikey: token },
        timeout: 15,
      })

      if (res.statusCode === 200) {
        return e.json(200, res.json)
      } else {
        return e.json(res.statusCode, { error: 'Failed to get QR code', details: res.json })
      }
    } catch (err) {
      return e.internalServerError('Failed to connect to Evolution API: ' + String(err))
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/evolution_api/logout',
  (e) => {
    let apiUrl =
      $secrets.get('EVOLUTION_API_URL') || 'https://evolution-evolution.6xxwvj.easypanel.host'
    let token = $secrets.get('EVOLUTION_API_KEY') || '7i5UsFq1MM8pEbt8NqCVDPglfY8v9LTd'
    const body = e.requestInfo().body || {}
    let targetInstance = body.instance || 'vmoda'

    try {
      const configs = $app.findRecordsByFilter(
        'whatsapp_configs',
        'user = {:userId}',
        '-created',
        100,
        0,
        { userId: e.auth.id },
      )
      if (configs && configs.length > 0) {
        let matched = null
        if (body.instance) {
          matched = configs.find((c) => {
            const ids = (c.getString('instance_id') || '').split(',').map((s) => s.trim())
            return ids.includes(body.instance)
          })
        }
        const config = matched || configs[0]
        if (config.getString('api_url')) apiUrl = config.getString('api_url')
        if (config.getString('token')) token = config.getString('token')
        if (!body.instance && config.getString('instance_id')) {
          targetInstance = config.getString('instance_id').split(',')[0].trim()
        }
      }
    } catch (_) {}

    try {
      const url = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const res = $http.send({
        url: `${url}/instance/logout/${targetInstance}`,
        method: 'DELETE',
        headers: { apikey: token },
        timeout: 15,
      })
      return e.json(200, { success: true })
    } catch (err) {
      return e.internalServerError('Failed to disconnect from Evolution API: ' + String(err))
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/evolution_api/send',
  (e) => {
    const body = e.requestInfo().body || {}
    const phone = body.phone
    const message = body.message

    if (!phone || !message) {
      return e.badRequestError('Telefone e mensagem são obrigatórios.')
    }

    const result = $whatsappRotator.sendWithRotation({
      userId: e.auth.id,
      phone: phone,
      message: message,
      instanceId: body.instance_id,
      configId: body.config_id,
    })

    if (!result.success) {
      return e.badRequestError(result.error || 'Falha ao enviar mensagem.')
    }

    // Registra a mensagem enviada no histórico (audit trail com qual número/instância disparou)
    try {
      let channelId = null
      const channelName = 'WhatsApp (' + result.instance + ')'
      try {
        const channels = $app.findRecordsByFilter('channels', "type='whatsapp'", '-created', 1, 0)
        if (channels.length > 0) {
          channelId = channels[0].id
        }
      } catch (_) {}

      if (!channelId) {
        const col = $app.findCollectionByNameOrId('channels')
        const rec = new Record(col)
        rec.set('name', 'WhatsApp')
        rec.set('type', 'whatsapp')
        rec.set('status', true)
        $app.save(rec)
        channelId = rec.id
      }

      const msgCol = $app.findCollectionByNameOrId('messages')
      const msgRec = new Record(msgCol)
      msgRec.set('channel', channelId)
      msgRec.set('sender_id', e.auth.id)
      const senderDisplay =
        (e.auth.getString('name') || e.auth.getString('email')) +
        ' [' +
        (result.label || result.instance) +
        ']'
      msgRec.set('sender_name', senderDisplay)
      msgRec.set('content', message)
      msgRec.set('direction', 'outbound')
      msgRec.set('status', 'replied')
      $app.save(msgRec)
    } catch (err) {
      $app.logger().error('Failed to log message to DB', 'err', String(err))
    }

    return e.json(result.statusCode || 200, {
      success: true,
      sent_via_instance: result.instance,
      sent_via_label: result.label,
      config_id: result.configId,
      phone: result.phone,
      data: result.data,
    })
  },
  $apis.requireAuth(),
)

// Alias /backend/v1/whatsapp/send apontando para a mesma lógica com rotação
routerAdd(
  'POST',
  '/backend/v1/whatsapp/send',
  (e) => {
    const body = e.requestInfo().body || {}
    const phone = body.phone
    const message = body.message

    if (!phone || !message) {
      return e.badRequestError('Telefone e mensagem são obrigatórios.')
    }

    const result = $whatsappRotator.sendWithRotation({
      userId: e.auth.id,
      phone: phone,
      message: message,
      instanceId: body.instance_id,
      configId: body.config_id,
    })

    if (!result.success) {
      return e.badRequestError(result.error || 'Falha ao enviar mensagem.')
    }

    return e.json(result.statusCode || 200, {
      success: true,
      sent_via_instance: result.instance,
      sent_via_label: result.label,
      config_id: result.configId,
      phone: result.phone,
      data: result.data,
    })
  },
  $apis.requireAuth(),
)
