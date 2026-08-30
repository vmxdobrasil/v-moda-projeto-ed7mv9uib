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

    const body = e.requestInfo().body || {}
    const targetUrl =
      body.target_url || 'https://v-moda-brasil-d7c0f.goskip.app/backend/v1/n8n-webhook'
    // Lote de envio paginado - padrão 500 records por vez
    const batchSize = Math.max(50, Math.min(1000, parseInt(body.batch_size) || 500))

    $app
      .logger()
      .info(
        '[Transferência V MODA 2] Iniciando transferência paginada...',
        'target',
        targetUrl,
        'batchSize',
        batchSize,
      )

    // Contar total de registros com telefone válido
    let totalCount = 0
    try {
      const countRow = new DynamicModel({ total: 0 })
      $app
        .db()
        .newQuery(
          "SELECT COUNT(id) as total FROM customers WHERE phone IS NOT NULL AND TRIM(phone) != ''",
        )
        .one(countRow)
      totalCount = countRow.total || 0
    } catch (countErr) {
      $app
        .logger()
        .error(
          '[Transferência V MODA 2] Erro ao contar clientes:',
          'error',
          countErr.message || String(countErr),
        )
      return e.json(500, {
        error: 'Erro ao contar clientes: ' + (countErr.message || String(countErr)),
      })
    }

    if (totalCount === 0) {
      return e.json(200, {
        success: true,
        message: 'Nenhum lead com telefone encontrado para transferir.',
        total: 0,
        batches_sent: 0,
        total_batches: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        errors: [],
      })
    }

    const totalBatches = Math.ceil(totalCount / batchSize)
    let batchesSent = 0
    let totalCreated = 0
    let totalUpdated = 0
    let totalSkipped = 0
    let totalFailed = 0
    const errorsList = []

    let lastId = ''
    let totalProcessedSoFar = 0

    // Loop paginado usando cursor por ID (ID > lastId ORDER BY id ASC LIMIT batchSize)
    // Isso é O(1) em memória por lote e previne estouro de memória (OOM) no runtime Goja.
    for (let b = 0; b < totalBatches; b++) {
      const batchRows = []
      try {
        let query
        if (lastId) {
          query = $app
            .db()
            .newQuery(
              "SELECT id, phone, name, source, email FROM customers WHERE phone IS NOT NULL AND TRIM(phone) != '' AND id > {:lastId} ORDER BY id ASC LIMIT {:limit}",
            )
            .bind({ lastId: lastId, limit: batchSize })
        } else {
          query = $app
            .db()
            .newQuery(
              "SELECT id, phone, name, source, email FROM customers WHERE phone IS NOT NULL AND TRIM(phone) != '' ORDER BY id ASC LIMIT {:limit}",
            )
            .bind({ limit: batchSize })
        }
        query.all(batchRows)
      } catch (dbErr) {
        const errMsg = `Erro ao ler lote ${b + 1}: ${dbErr.message || String(dbErr)}`
        $app.logger().error(`[Transferência V MODA 2] ${errMsg}`)
        errorsList.push(errMsg)
        break
      }

      if (batchRows.length === 0) {
        $app
          .logger()
          .info(
            `[Transferência V MODA 2] Nenhum registro adicional retornado no lote ${b + 1} após ID '${lastId}'. Encerrando paginação. Total processado até agora: ${totalProcessedSoFar}/${totalCount}.`,
          )
        break
      }

      // Atualiza o cursor lastId
      lastId = batchRows[batchRows.length - 1].id
      totalProcessedSoFar += batchRows.length

      // Monta o payload do lote atual
      const leadsPayload = []
      for (let i = 0; i < batchRows.length; i++) {
        const item = batchRows[i]
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
        $app
          .logger()
          .warn(
            `[Transferência V MODA 2] Lote ${b + 1} ignorado: nenhum registro com telefone válido encontrado entre os ${batchRows.length} lidos.`,
          )
        continue
      }

      // Envia o lote via $http.send
      try {
        const res = $http.send({
          url: targetUrl,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'V-Moda-Brasil-Transfer-Agent/2.0',
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

            if (c === 0 && u === 0 && s === 0 && f === 0) {
              totalCreated += leadsPayload.length
            }

            $app
              .logger()
              .info(
                `[Transferência V MODA 2] Lote ${b + 1}/${totalBatches} (${leadsPayload.length} leads). Criados: ${c}, Atualizados: ${u}, Ignorados: ${s}, Falhas: ${f}`,
              )
          } else {
            totalCreated += leadsPayload.length
            $app
              .logger()
              .info(
                `[Transferência V MODA 2] Lote ${b + 1}/${totalBatches} status ${res.statusCode} (${leadsPayload.length} leads).`,
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
        const errMsg = `Lote ${b + 1}/${totalBatches} erro de conexão: ${httpErr.message || String(httpErr)}`
        $app.logger().error(`[Transferência V MODA 2] ${errMsg}`)
        errorsList.push(errMsg)
      }
    }

    const summary = {
      success: errorsList.length === 0,
      total: totalCount,
      processed: totalProcessedSoFar,
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
        `[Transferência V MODA 2] Finalizada. Total: ${totalCount}, Processados: ${totalProcessedSoFar}, Lotes: ${batchesSent}/${totalBatches}, Criados: ${totalCreated}, Atualizados: ${totalUpdated}, Falhas: ${totalFailed}`,
      )

    return e.json(200, summary)
  },
  $apis.requireAuth(),
)
