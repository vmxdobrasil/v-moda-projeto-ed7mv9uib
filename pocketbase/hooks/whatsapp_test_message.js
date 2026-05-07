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
      config = $app.findFirstRecordByData('whatsapp_configs', 'user', e.auth.id)
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
      return e.badRequestError('Erro ao comunicar com a Evolution API.')
    }

    if (res.statusCode >= 400) {
      let errorMsg = 'Erro na Evolution API: ' + res.statusCode
      try {
        if (res.json && res.json.message) {
          errorMsg = res.json.message
        }
      } catch (_) {}
      return e.badRequestError(errorMsg)
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
        return e.badRequestError('Falha ao criar o registro de canal: ' + err.message)
      }
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
      return e.badRequestError('Falha ao registrar a mensagem na coleção messages: ' + err.message)
    }

    return e.json(200, res.json || { success: true })
  },
  $apis.requireAuth(),
)
