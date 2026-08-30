routerAdd(
  'POST',
  '/backend/v1/transfer-to-v-moda-2',
  (e) => {
    // 1. Verificação de autenticação de administrador
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
      return e.forbiddenError('Apenas administradores podem executar esta transferência.')
    }

    // Parâmetros opcionais de offset / batchSize caso queira controle
    const body = e.requestInfo().body || {}
    const targetUrl =
      body.target_url || 'https://v-moda-brasil-d7c0f.goskip.app/backend/v1/n8n-webhook'
    const batchSize = Math.max(50, Math.min(1000, parseInt(body.batch_size) || 493))

    $app
      .logger()
      .info(
        '[Transferência V MODA 2] Iniciando leitura da base de clientes...',
        'target',
        targetUrl,
      )

    // 2. Consulta de leads com telefone preenchido
    // Usando SQL direto ou findRecordsByFilter.
    // Como são ~31.000 registros, newQuery SQL é extremamente rápido e consome pouca memória.
    let rows = []
    try {
      const query = $app
        .db()
        .newQuery(
          "SELECT phone, name, source, email FROM customers WHERE phone IS NOT NULL AND TRIM(phone) != '' ORDER BY id ASC",
        )
      rows = query.all()
    } catch (dbErr) {
      $app
        .logger()
        .error(
          '[Transferência V MODA 2] Erro ao consultar banco:',
          'error',
          dbErr.message || String(dbErr),
        )
      return e.json(500, {
        error: 'Erro ao consultar clientes: ' + (dbErr.message || String(dbErr)),
      })
    }

    const totalLeads = rows.length
    $app
      .logger()
      .info('[Transferência V MODA 2] Leads válidos encontrados para envio:', 'total', totalLeads)

    if (totalLeads === 0) {
      return e.json(200, {
        success: true,
        message: 'Nenhum lead com telefone encontrado para transferir.',
        total: 0,
        batches_sent: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        errors: [],
      })
    }

    // 3. Montar lotes e enviar via $http.send
    const totalBatches = Math.ceil(totalLeads / batchSize)
    let batchesSent = 0
    let totalCreated = 0
    let totalUpdated = 0
    let totalSkipped = 0
    let totalFailed = 0
    const errorsList = []

    for (let b = 0; b < totalBatches; b++) {
      const startIdx = b * batchSize
      const endIdx = Math.min(startIdx + batchSize, totalLeads)
      const chunk = rows.slice(startIdx, endIdx)

      const leadsPayload = []
      for (let i = 0; i < chunk.length; i++) {
        const item = chunk[i]
        const phone = (item.phone || '').toString().trim()
        if (!phone) continue

        const leadObj = {
          phone: phone,
          name: (item.name || '').toString().trim() || 'Lead WhatsApp',
          source: (item.source || '').toString().trim() || 'transferencia_vmoda',
        }
        const email = (item.email || '').toString().trim()
        if (email) {
          leadObj.email = email
        }
        leadsPayload.push(leadObj)
      }

      if (leadsPayload.length === 0) {
        continue
      }

      try {
        const res = $http.send({
          url: targetUrl,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'V-Moda-Brasil-Transfer-Agent/1.0',
          },
          body: JSON.stringify({
            leads: leadsPayload,
          }),
          timeout: 120, // 2 minutos por lote
        })

        batchesSent++

        let resData = null
        try {
          resData = res.json || (res.raw ? JSON.parse(res.raw) : null)
        } catch (_) {
          resData = null
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (resData && typeof resData === 'object') {
            const c = typeof resData.created === 'number' ? resData.created : 0
            const u = typeof resData.updated === 'number' ? resData.updated : 0
            const s = typeof resData.skipped === 'number' ? resData.skipped : 0
            const f = typeof resData.failed === 'number' ? resData.failed : 0

            totalCreated += c
            totalUpdated += u
            totalSkipped += s
            totalFailed += f

            // Se o endpoint retornou sucesso geral sem desmembrar contagens
            if (c === 0 && u === 0 && s === 0 && f === 0) {
              totalCreated += leadsPayload.length
            }

            $app
              .logger()
              .info(
                `[Transferência V MODA 2] Lote ${b + 1}/${totalBatches} enviado com sucesso (${leadsPayload.length} leads). Criados: ${c}, Atualizados: ${u}, Ignorados: ${s}, Falhas: ${f}`,
              )
          } else {
            totalCreated += leadsPayload.length
            $app
              .logger()
              .info(
                `[Transferência V MODA 2] Lote ${b + 1}/${totalBatches} enviado com status ${res.statusCode} (${leadsPayload.length} leads).`,
              )
          }
        } else {
          totalFailed += leadsPayload.length
          const errMsg = `Lote ${b + 1}/${totalBatches} falhou com status HTTP ${res.statusCode}: ${res.raw ? res.raw.substring(0, 200) : 'Sem resposta'}`
          $app.logger().error(`[Transferência V MODA 2] ${errMsg}`)
          errorsList.push(errMsg)
        }
      } catch (httpErr) {
        totalFailed += leadsPayload.length
        const errMsg = `Lote ${b + 1}/${totalBatches} falhou por erro de conexão: ${httpErr.message || String(httpErr)}`
        $app.logger().error(`[Transferência V MODA 2] ${errMsg}`)
        errorsList.push(errMsg)
      }
    }

    const summary = {
      success: errorsList.length === 0,
      total: totalLeads,
      batches_sent: batchesSent,
      total_batches: totalBatches,
      created: totalCreated,
      updated: totalUpdated,
      skipped: totalSkipped,
      failed: totalFailed,
      errors: errorsList,
    }

    $app
      .logger()
      .info(
        `[Transferência V MODA 2] Concluída! Total: ${totalLeads}, Lotes: ${batchesSent}/${totalBatches}, Criados: ${totalCreated}, Atualizados: ${totalUpdated}, Falhas: ${totalFailed}`,
      )

    return e.json(200, summary)
  },
  $apis.requireAuth(),
)
