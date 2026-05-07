routerAdd(
  'GET',
  '/backend/v1/evolution/status',
  (e) => {
    let config
    try {
      config = $app.findFirstRecordByData('whatsapp_configs', 'user', e.auth.id)
    } catch (_) {
      return e.json(200, { state: 'disconnected' })
    }

    const apiUrl = config.getString('api_url')
    const token = config.getString('token')
    const instanceId = config.getString('instance_id')

    if (!apiUrl || !token || !instanceId) {
      return e.json(200, { state: 'disconnected' })
    }

    try {
      const url = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const res = $http.send({
        url: `${url}/instance/connectionState/${instanceId}`,
        method: 'GET',
        headers: { apikey: token },
        timeout: 10,
      })

      if (res.statusCode === 200) {
        return e.json(200, res.json)
      }
    } catch (err) {
      $app.logger().error('Evolution API Status Error', 'err', String(err))
    }

    return e.json(200, { state: 'disconnected' })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/evolution/send',
  (e) => {
    let config
    try {
      config = $app.findFirstRecordByData('whatsapp_configs', 'user', e.auth.id)
    } catch (_) {
      throw new Error('Configuração do WhatsApp não encontrada.')
    }

    const apiUrl = config.getString('api_url')
    const token = config.getString('token')
    const instanceId = config.getString('instance_id')

    if (!apiUrl || !token || !instanceId) {
      throw new Error('Configuração do WhatsApp incompleta.')
    }

    const body = e.requestInfo().body
    const phone = body.phone
    const message = body.message

    if (!phone || !message) {
      return e.badRequestError('Telefone e mensagem são obrigatórios.')
    }

    const url = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl

    try {
      const res = $http.send({
        url: `${url}/message/sendText/${instanceId}`,
        method: 'POST',
        headers: {
          apikey: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: phone,
          options: { delay: 1200, presence: 'composing' },
          textMessage: { text: message },
        }),
        timeout: 15,
      })

      return e.json(res.statusCode, res.json)
    } catch (err) {
      $app.logger().error('Evolution API Send Error', 'err', String(err))
      return e.internalServerError('Falha ao se conectar com a Evolution API.')
    }
  },
  $apis.requireAuth(),
)
