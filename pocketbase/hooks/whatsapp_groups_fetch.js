routerAdd(
  'GET',
  '/backend/v1/whatsapp/groups',
  (e) => {
    const instance = e.request.url.query().get('instance')
    if (!instance) return e.badRequestError('Instance required')

    const config = $app.findFirstRecordByData('whatsapp_configs', 'user', e.auth.id)
    const apiUrl = config.getString('api_url').replace(/\/$/, '')
    const token = config.getString('token')

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
