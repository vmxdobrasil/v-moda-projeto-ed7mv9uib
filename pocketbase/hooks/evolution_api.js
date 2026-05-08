routerAdd(
  'GET',
  '/backend/v1/evolution/status',
  (e) => {
    const instanceQuery = e.request.url.query().get('instance')
    let config
    let targetInstance = instanceQuery

    try {
      const configs = $app.findRecordsByFilter(
        'whatsapp_configs',
        'user = {:userId}',
        '-created',
        100,
        0,
        { userId: e.auth.id },
      )
      if (!configs || configs.length === 0) {
        return e.json(200, { state: 'disconnected', error: 'Configuração não encontrada' })
      }

      if (instanceQuery) {
        config = configs.find((c) =>
          c
            .getString('instance_id')
            .split(',')
            .map((i) => i.trim())
            .includes(instanceQuery),
        )
      } else {
        config = configs[0]
        targetInstance = config.getString('instance_id').split(',')[0].trim()
      }
    } catch (_) {
      return e.json(200, { state: 'disconnected', error: 'Erro ao buscar configuração' })
    }

    if (!config) {
      return e.json(200, {
        state: 'disconnected',
        error: 'Instância não encontrada na configuração',
      })
    }

    const apiUrl = config.getString('api_url')
    const token = config.getString('token')

    if (!apiUrl || !token || !targetInstance) {
      return e.json(200, { state: 'disconnected', error: 'Configuração incompleta' })
    }

    try {
      const url = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const res = $http.send({
        url: `${url}/instance/connectionState/${targetInstance}`,
        method: 'GET',
        headers: { apikey: token },
        timeout: 10,
      })

      if (res.statusCode === 200) {
        return e.json(200, res.json)
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
        return e.json(200, { state: 'disconnected', error: `Erro na API: ${res.statusCode}` })
      }
    } catch (err) {
      $app.logger().error('Evolution API Status Error', 'err', String(err))
      return e.json(200, { state: 'disconnected', error: 'Falha de conexão com a API Evolution' })
    }
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

      if (res.statusCode >= 400) {
        $app
          .logger()
          .error(
            'Evolution API Send API Error',
            'statusCode',
            res.statusCode,
            'body',
            String(res.body),
            'phone',
            phone,
          )
        let errorMsg = 'Erro na API'
        try {
          if (res.json && res.json.message) errorMsg = res.json.message
        } catch (_) {}
        return e.badRequestError(`Erro ao enviar: ${errorMsg}`)
      }

      return e.json(res.statusCode, res.json)
    } catch (err) {
      $app.logger().error('Evolution API Send Transport Error', 'err', String(err))
      return e.internalServerError(
        'Falha de transporte ao se conectar com a Evolution API: ' + err.message,
      )
    }
  },
  $apis.requireAuth(),
)
