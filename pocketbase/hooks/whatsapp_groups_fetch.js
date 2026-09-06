routerAdd(
  'GET',
  '/backend/v1/whatsapp/groups',
  (e) => {
    const instance = e.request.url.query().get('instance')
    if (!instance) return e.badRequestError('Instance required')

    let apiUrl = (
      $secrets.get('EVOLUTION_API_URL') || 'https://evolution-evolution.6xxwvj.easypanel.host'
    ).replace(/\/$/, '')
    let token = $secrets.get('EVOLUTION_API_KEY') || '7i5UsFq1MM8pEbt8NqCVDPglfY8v9LTd'

    try {
      const configs = $app.findRecordsByFilter(
        'whatsapp_configs',
        'user = {:userId}',
        '-created',
        100,
        0,
        { userId: e.auth.id },
      )
      if (configs.length > 0) {
        let matched = configs.find((c) => {
          const ids = (c.getString('instance_id') || '').split(',').map((s) => s.trim())
          return ids.includes(instance)
        })
        const config = matched || configs[0]
        if (config.getString('api_url')) apiUrl = config.getString('api_url').replace(/\/$/, '')
        if (config.getString('token')) token = config.getString('token')
      }
    } catch (_) {}

    let res
    try {
      res = $http.send({
        url: apiUrl + '/group/fetchAllGroups/' + instance + '?getParticipants=false',
        method: 'GET',
        headers: { apikey: token },
        timeout: 15,
      })
    } catch (err) {
      return e.badRequestError('Erro ao comunicar com a Evolution API.')
    }

    if (res.statusCode >= 400) {
      return e.badRequestError('Erro na Evolution API: ' + res.statusCode)
    }

    return e.json(200, res.json)
  },
  $apis.requireAuth(),
)
