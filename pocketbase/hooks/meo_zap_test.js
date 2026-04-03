routerAdd(
  'POST',
  '/backend/v1/whatsapp/test-connection',
  (e) => {
    const body = e.requestInfo().body || {}
    const url = body.api_url
    const token = body.token

    if (!url) {
      return e.badRequestError('Missing API URL')
    }

    try {
      let testUrl = url.trim()
      if (testUrl.endsWith('/')) testUrl = testUrl.slice(0, -1)

      const headers = {}
      if (token) {
        headers['Authorization'] = 'Bearer ' + token
      }

      const res = $http.send({
        url: testUrl + '/status',
        method: 'GET',
        headers: headers,
        timeout: 10,
      })

      return e.json(200, { success: true, statusCode: res.statusCode })
    } catch (err) {
      return e.badRequestError('Connection failed: ' + err.message)
    }
  },
  $apis.requireAuth(),
)
