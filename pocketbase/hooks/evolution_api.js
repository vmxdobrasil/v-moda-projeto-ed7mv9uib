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
        timeout: 3,
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
  'POST',
  '/backend/v1/evolution_api/send',
  (e) => {
    let apiUrl =
      $secrets.get('EVOLUTION_API_URL') || 'https://evolution-evolution.6xxwvj.easypanel.host'
    let token = $secrets.get('EVOLUTION_API_KEY') || '7i5UsFq1MM8pEbt8NqCVDPglfY8v9LTd'
    const body = e.requestInfo().body
    let instanceId = body.instance_id || 'vmoda'

    try {
      const config = $app.findFirstRecordByData('whatsapp_configs', 'user', e.auth.id)
      if (config.getString('api_url')) apiUrl = config.getString('api_url')
      if (config.getString('token')) token = config.getString('token')
      if (!body.instance_id && config.getString('instance_id')) {
        instanceId = config.getString('instance_id').split(',')[0].trim()
      }
    } catch (_) {}

    if (!apiUrl || !token || !instanceId) {
      return e.badRequestError('Configuração do WhatsApp incompleta.')
    }

    let phone = body.phone
    const message = body.message

    if (!phone || !message) {
      return e.badRequestError('Telefone e mensagem são obrigatórios.')
    }

    phone = phone.replace(/\D/g, '')
    if (phone.length === 10 || phone.length === 11) {
      phone = '55' + phone
    }
    if (phone.length < 12) {
      return e.badRequestError(
        'Número de telefone inválido. O formato esperado é 55 + DDD + 9 dígitos.',
      )
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
        timeout: 3,
      })

      if (res.statusCode >= 400) {
        $app
          .logger()
          .error(
            'Evolution API Send Error',
            'statusCode',
            res.statusCode,
            'body',
            String(res.body),
            'phone',
            phone,
          )
        return e.badRequestError(`Erro ao enviar: ${res.statusCode}`)
      }

      return e.json(res.statusCode, res.json)
    } catch (err) {
      $app.logger().error('Evolution API Send Transport Error', 'err', String(err))
      return e.internalServerError('Falha de transporte ao se conectar com a Evolution API.')
    }
  },
  $apis.requireAuth(),
)
