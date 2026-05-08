routerAdd(
  'POST',
  '/backend/v1/whatsapp/test-message',
  (e) => {
    const body = e.requestInfo().body
    const instance = body.instance
    const phone = body.phone
    const text = body.text

    if (!instance || !phone || !text) {
      return e.badRequestError('Erro: Configuração da instância incompleta. Parâmetros ausentes.')
    }

    let config
    try {
      const configs = $app.findRecordsByFilter(
        'whatsapp_configs',
        'user = {:userId}',
        '-created',
        100,
        0,
        { userId: e.auth.id },
      )
      config = configs.find((c) => {
        const insts = c
          .getString('instance_id')
          .split(',')
          .map((i) => i.trim())
        return insts.includes(instance)
      })
      if (!config && configs.length > 0) {
        config = configs[0]
      }
      if (!config) throw new Error('Not found')
    } catch (_) {
      return e.badRequestError(
        'Erro de permissão: Configurações do WhatsApp não encontradas para este usuário.',
      )
    }

    const apiUrl = config.getString('api_url').replace(/\/$/, '')
    const token = config.getString('token')

    let res
    try {
      res = $http.send({
        url: apiUrl + '/message/sendText/' + instance,
        method: 'POST',
        headers: { apikey: token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: phone,
          text: text,
        }),
        timeout: 15,
      })
    } catch (err) {
      $app
        .logger()
        .error(
          'WhatsApp Test Message Transport Error',
          'error',
          err.message,
          'phone',
          phone,
          'instance',
          instance,
        )
      return e.badRequestError('Erro de conexão com a Evolution API: ' + err.message)
    }

    if (res.statusCode >= 400) {
      let errorMsg = 'Erro na Evolution API: ' + res.statusCode
      let errorCode = 'API_ERROR'
      try {
        if (res.json) {
          errorMsg = res.json.message || res.json.error || errorMsg
          errorCode = res.json.code || errorCode
        } else {
          const bodyStr = new TextDecoder().decode(res.body)
          errorMsg = bodyStr || errorMsg
        }
      } catch (_) {}

      $app
        .logger()
        .error(
          'WhatsApp Test Message API Error',
          'statusCode',
          res.statusCode,
          'message',
          errorMsg,
          'phone',
          phone,
          'instance',
          instance,
        )
      return e.badRequestError(`Falha no envio (${errorCode}): ${errorMsg}`)
    }

    // Find or create channel for the instance
    let channelRecord
    try {
      channelRecord = $app.findFirstRecordByFilter(
        'channels',
        "type = 'whatsapp' && name = {:name}",
        { name: instance },
      )
    } catch (_) {
      try {
        const channelsCollection = $app.findCollectionByNameOrId('channels')
        channelRecord = new Record(channelsCollection)
        channelRecord.set('name', instance)
        channelRecord.set('type', 'whatsapp')
        channelRecord.set('status', true)
        $app.save(channelRecord)
      } catch (err) {
        $app.logger().error('Erro ao criar canal', 'error', err.message)
        return e.badRequestError(
          "Field 'channel' is required. Falha ao criar o registro de canal: " + err.message,
        )
      }
    }

    if (!channelRecord || !channelRecord.id) {
      return e.badRequestError("Field 'channel' is required. Canal inválido ou não encontrado.")
    }

    // Create message record for auditing
    try {
      const messagesCollection = $app.findCollectionByNameOrId('messages')
      const messageRecord = new Record(messagesCollection)
      messageRecord.set('channel', channelRecord.id)
      messageRecord.set('sender_id', phone)
      messageRecord.set('content', text)
      messageRecord.set('direction', 'outbound')
      messageRecord.set('status', 'pending')
      $app.save(messageRecord)
    } catch (err) {
      $app.logger().error('Erro ao criar registro em messages', 'error', err.message)
      return e.badRequestError('Failed to create record. Validation error: ' + err.message)
    }

    return e.json(200, res.json || { success: true })
  },
  $apis.requireAuth(),
)
