routerAdd(
  'POST',
  '/backend/v1/test-target-webhook',
  (e) => {
    // Verificação de autenticação de administrador
    const authRecord = e.auth
    if (!authRecord) {
      return e.unauthorizedError('Autenticação necessária')
    }

    const userRole = authRecord.getString
      ? authRecord.getString('role')
      : authRecord.get('role') || ''
    const userEmail = authRecord.getString
      ? authRecord.getString('email')
      : authRecord.get('email') || ''
    const isSuperuser = authRecord.collectionName === '_superusers'
    const isAdmin = isSuperuser || userRole === 'admin' || userEmail === 'valterpmendonca@gmail.com'

    if (!isAdmin) {
      return e.forbiddenError('Apenas administradores podem testar o webhook.')
    }

    const body = e.requestInfo().body || {}
    let targetUrl = (body.target_url || '').trim()

    if (!targetUrl) {
      try {
        const settingRec = $app.findFirstRecordByData(
          'brand_settings',
          'key',
          'migration_target_webhook_url',
        )
        const savedUrl = (settingRec.getString('value_text') || '').trim()
        if (savedUrl) {
          targetUrl = savedUrl
        }
      } catch (_) {}
    }

    if (!targetUrl) {
      targetUrl = 'https://v-moda-brasil-d7c0f.goskip.app/backend/v1/n8n-webhook'
    }

    // Validação básica de URL no backend
    if (!targetUrl.startsWith('https://') && !targetUrl.startsWith('http://')) {
      return e.json(400, {
        success: false,
        statusCode: 400,
        message: 'A URL informada deve iniciar com https://',
        targetUrl: targetUrl,
      })
    }

    // Payload de teste: envia tanto {"test": true} quanto lead fictício de teste com phone 5599999999999
    const testPayload = {
      test: true,
      leads: [
        {
          name: 'Teste Conexao Transferencia',
          phone: '5599999999999',
          source: 'connection_test',
        },
      ],
    }

    try {
      const res = $http.send({
        url: targetUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'V-Moda-Brasil-Transfer-Tester/1.0',
        },
        body: JSON.stringify(testPayload),
        timeout: 20, // 20 segundos de timeout para teste rápido
      })

      const status = res.statusCode
      let resData = null
      try {
        resData = res.json || (res.raw ? JSON.parse(res.raw) : null)
      } catch (_) {
        resData = null
      }

      if (status >= 200 && status < 300) {
        return e.json(200, {
          success: true,
          statusCode: status,
          message: 'Webhook respondendo com sucesso!',
          details: resData || (res.raw ? String(res.raw).substring(0, 200) : 'OK'),
          targetUrl: targetUrl,
        })
      }

      let tip = ''
      if (status === 405 || status === 404) {
        tip =
          'Rota não encontrada no destino. Verifique se a URL é a de PRODUÇÃO do V MODA BRASIL 2 (não a de preview) e se termina em /backend/v1/n8n-webhook'
      }

      const rawSnippet = res.raw ? String(res.raw).substring(0, 250) : ''
      return e.json(200, {
        success: false,
        statusCode: status,
        message: `Status ${status} — ${tip || 'Destino recusou ou respondeu com erro.'}`,
        rawSnippet: rawSnippet,
        targetUrl: targetUrl,
        tip: tip || undefined,
      })
    } catch (httpErr) {
      return e.json(200, {
        success: false,
        statusCode: 0,
        message: `Falha de rede/conexão com o destino: ${httpErr.message || String(httpErr)}`,
        targetUrl: targetUrl,
      })
    }
  },
  $apis.requireAuth(),
)
