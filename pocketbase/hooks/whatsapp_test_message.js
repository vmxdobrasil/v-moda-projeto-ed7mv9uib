routerAdd(
  'POST',
  '/backend/v1/whatsapp/test-message',
  (e) => {
    const body = e.requestInfo().body
    const instance = body.instance
    const phone = body.phone
    const text = body.text

    if (!instance || !phone || !text) {
      return e.badRequestError('Parâmetros ausentes.')
    }

    const config = $app.findFirstRecordByData('whatsapp_configs', 'user', e.auth.id)
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
      return e.badRequestError('Erro na Evolution API: ' + res.statusCode)
    }

    return e.json(200, res.json)
  },
  $apis.requireAuth(),
)
