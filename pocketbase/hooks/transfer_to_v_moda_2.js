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
        '[Transferência V MODA 2] Iniciando processo de transferência por OFFSET...',
        'target',
        targetUrl,
        'batchSize',
        batchSize,
      )

    // Filtro padrão para leads válidos com telefone
    const filterExpr = "phone != '' && phone != null"

    // Contar total de registros com telefone válido
    let totalCount = 0
    try {
      const allMatches = $app.findRecordsByFilter('customers', filterExpr, '', 0, 0)
      totalCount = allMatches.length
    } catch (countErr) {
      $app
        .logger()
        .warn(
          '[Transferência V MODA 2] Falha ao obter total com findRecordsByFilter (limit 0):',
          'error',
          countErr.message || String(countErr),
        )
      try {
        totalCount = $app.countRecords('customers')
      } catch (_) {
        totalCount = 30771
      }
    }

    $app
      .logger()
      .info(`[Transferência V MODA 2] Total de clientes identificados na base: ${totalCount}`)

    if (totalCount === 0) {
      return e.json(200, {
        success: true,
        message: 'Nenhum lead com telefone encontrado para transferir.',
        total: 0,
        processed: 0,
        batches_sent: 0,
        total_batches: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        errors: [],
      })
    }

    let batchesSent = 0
    let totalCreated = 0
    let totalUpdated = 0
    let totalSkipped = 0
    let totalFailed = 0
    const errorsList = []

    let offset = 0
    let batchIndex = 0
    let totalProcessedSoFar = 0
    const totalBatches = Math.ceil(totalCount / batchSize)

    while (true) {
      batchIndex++

      let records = []
      try {
        records = $app.findRecordsByFilter('customers', filterExpr, 'id', batchSize, offset)
      } catch (queryErr) {
        const errMsg = `Erro ao consultar lote ${batchIndex} no offset ${offset}: ${queryErr.message || String(queryErr)}`
        $app.logger().error(`[Transferência V MODA 2] ${errMsg}`)
        errorsList.push(errMsg)
        break
      }

      if (!Array.isArray(records) || records.length === 0) {
        $app
          .logger()
          .info(
            `[Transferência V MODA 2] Nenhum registro retornado no lote ${batchIndex} (offset ${offset}). Fim da paginação. Total processado: ${totalProcessedSoFar}/${totalCount}.`,
          )
        break
      }

      totalProcessedSoFar += records.length

      $app
        .logger()
        .info(
          `[Transferência V MODA 2] Lote ${batchIndex}/${totalBatches} lido: ${records.length} registros (offset ${offset}). Total acumulado: ${totalProcessedSoFar}`,
        )

      // Monta o payload do lote atual
      const leadsPayload = []
      for (let i = 0; i < records.length; i++) {
        const rec = records[i]
        const phone = (rec.getString('phone') || '').trim()
        if (!phone) continue

        const leadObj = {
          phone: phone,
          name: (rec.getString('name') || '').trim() || 'Lead WhatsApp',
          source: (rec.getString('source') || '').trim() || 'transferencia_vmoda',
        }
        const email = (rec.getString('email') || '').trim()
        if (email) {
          leadObj.email = email
        }
        leadsPayload.push(leadObj)
      }

      if (leadsPayload.length === 0) {
        $app
          .logger()
          .warn(
            `[Transferência V MODA 2] Lote ${batchIndex} não possui registros com telefone válido. Ignorando envio.`,
          )
        offset += batchSize
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
                `[Transferência V MODA 2] Lote ${batchIndex}/${totalBatches} enviado com sucesso (${leadsPayload.length} leads). Resposta do destino: criados=${c}, atualizados=${u}, ignorados=${s}, falhas=${f}`,
              )
          } else {
            totalCreated += leadsPayload.length
            $app
              .logger()
              .info(
                `[Transferência V MODA 2] Lote ${batchIndex}/${totalBatches} status HTTP ${res.statusCode} (${leadsPayload.length} leads enviados).`,
              )
          }
        } else {
          totalFailed += leadsPayload.length
          const rawSnippet = res.raw ? String(res.raw).substring(0, 300) : 'Sem corpo de resposta'
          const errMsg = `Lote ${batchIndex} (offset ${offset}) falhou com status HTTP ${res.statusCode}: ${rawSnippet}`
          $app.logger().error(`[Transferência V MODA 2] ${errMsg}`)
          errorsList.push(errMsg)
        }
      } catch (httpErr) {
        totalFailed += leadsPayload.length
        const errMsg = `Lote ${batchIndex} (offset ${offset}) erro de requisição HTTP para destino (${targetUrl}): ${httpErr.message || String(httpErr)}`
        $app.logger().error(`[Transferência V MODA 2] ${errMsg}`)
        errorsList.push(errMsg)
      }

      // Avança o offset para o próximo lote
      offset += batchSize

      // Se o lote retornado foi menor que batchSize, chegamos ao final da coleção
      if (records.length < batchSize) {
        $app
          .logger()
          .info(
            `[Transferência V MODA 2] Lote ${batchIndex} retornou ${records.length} < ${batchSize}. Fim da base alcançado.`,
          )
        break
      }
    }

    const calculatedTotalBatches = totalBatches > 0 ? totalBatches : batchesSent
    const summary = {
      success: errorsList.length === 0 && batchesSent > 0,
      total: totalCount,
      processed: totalProcessedSoFar,
      batches_sent: batchesSent,
      total_batches: calculatedTotalBatches,
      created: totalCreated,
      updated: totalUpdated,
      skipped: totalSkipped,
      failed: totalFailed,
      errors: errorsList,
    }

    $app
      .logger()
      .info(
        `[Transferência V MODA 2] Finalizada com sucesso=${summary.success}. Total: ${totalCount}, Processados: ${totalProcessedSoFar}, Lotes: ${batchesSent}/${calculatedTotalBatches}, Criados: ${totalCreated}, Atualizados: ${totalUpdated}, Falhas: ${totalFailed}`,
      )

    return e.json(200, summary)
  },
  $apis.requireAuth(),
)
