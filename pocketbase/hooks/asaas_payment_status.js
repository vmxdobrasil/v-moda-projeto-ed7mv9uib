routerAdd(
  'GET',
  '/backend/v1/asaas/payments/{id}/status',
  (e) => {
    const id = e.request.pathValue('id')
    const asaasUrl = $secrets.get('ASAAS_API_URL') || 'https://sandbox.asaas.com/api/v3'
    const apiKey = $secrets.get('ASAAS_API_KEY')

    if (!apiKey) return e.internalServerError('A chave da API Asaas não está configurada.')

    function sleep(ms) {
      const start = Date.now()
      while (Date.now() - start < ms) {}
    }

    function fetchRetry(url, options) {
      const retries = [2000, 4000, 8000]
      for (let i = 0; i <= retries.length; i++) {
        try {
          const res = $http.send({ url, ...options, timeout: 15 })
          if (res.statusCode >= 200 && res.statusCode < 300) return res
          if (res.statusCode >= 400 && res.statusCode < 500 && res.statusCode !== 429) return res
          throw new Error(`HTTP ${res.statusCode}`)
        } catch (err) {
          if (i === retries.length) throw err
          sleep(retries[i])
        }
      }
    }

    try {
      let url = `${asaasUrl}/payments/${id}`
      if (!id.startsWith('pay_')) {
        url = `${asaasUrl}/payments?externalReference=${id}`
      }

      const res = fetchRetry(url, {
        method: 'GET',
        headers: { access_token: apiKey },
      })

      if (res.statusCode >= 400) {
        return e.badRequestError('Cobrança não encontrada ou erro no provedor', res.json)
      }

      const payment = id.startsWith('pay_') ? res.json : res.json.data?.[0] || null

      if (!payment) {
        return e.notFoundError('Nenhuma cobrança encontrada para a referência fornecida.')
      }

      // Synchronize local database
      if (payment.status === 'RECEIVED' || payment.status === 'CONFIRMED') {
        const extRef = payment.externalReference
        if (extRef) {
          $app.runInTransaction((txApp) => {
            try {
              const order = txApp.findRecordById('orders', extRef)
              if (order.getString('status') !== 'paid') {
                order.set('status', 'paid')
                txApp.save(order)
              }
            } catch (_) {}
          })
        }
      }

      return e.json(200, payment)
    } catch (err) {
      $app.logger().error('Asaas status check failed', 'error', err.message)
      return e.internalServerError('Falha ao verificar status do pagamento.')
    }
  },
  $apis.requireAuth(),
)
