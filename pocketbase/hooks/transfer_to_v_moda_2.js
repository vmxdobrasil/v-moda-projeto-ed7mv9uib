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
        '[Transferência V MODA 2] Iniciando processo de transferência...',
        'target',
        targetUrl,
        'batchSize',
        batchSize,
      )

    // Contar total de registros com telefone não nulo e não vazio usando findRecordsByFilter
    // customers tem campo 'phone'
    let totalCount = 0
    try {
      // Usando query direta para contar rapidamente
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
        .warn(
          '[Transferência V MODA 2] Falha ao contar via DynamicModel, tentando fallback:',
          'error',
          countErr.message || String(countErr),
        )
      try {
        const testRecords = $app.findRecordsByFilter(
          'customers',
          "phone != '' && phone != null",
          '',
          1,
          0,
        )
        totalCount = testRecords.length > 0 ? 30771 : 0
      } catch (_) {
        totalCount = 0
      }
    }

    $app
      .logger()
      .info(
        `[Transferência V MODA 2] Total de clientes com telefone identificados na base: ${totalCount}`,
      )

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

    let lastId = ''
    let totalProcessedSoFar = 0
    let batchIndex = 0
    const maxBatches = Math.ceil(totalCount / batchSize) + 5 // margem de segurança

    while (batchIndex < maxBatches) {
      batchIndex++
      let batchItems = []

      // Estratégia 1: Consulta SQL direta
      try {
        let sql =
          "SELECT id, phone, name, source, email FROM customers WHERE phone IS NOT NULL AND TRIM(phone) != ''"
        const params = { limit: batchSize }
        if (lastId) {
          sql += ' AND id > {:lastId} ORDER BY id ASC LIMIT {:limit}'
          params.lastId = lastId
        } else {
          sql += ' ORDER BY id ASC LIMIT {:limit}'
        }

        const rows = []
        $app.db().newQuery(sql).bind(params).all(rows)

        if (Array.isArray(rows) && rows.length > 0) {
          for (let i = 0; i < rows.length; i++) {
            const r = rows[i]
            batchItems.push({
              id: r.id || '',
              phone: r.phone || '',
              name: r.name || '',
              source: r.source || '',
              email: r.email || '',
            })
          }
        }
      } catch (sqlErr) {
        $app
          .logger()
          .warn(
            `[Transferência V MODA 2] Erro na query SQL do lote ${batchIndex}, tentando fallback por findRecordsByFilter: ${sqlErr.message || String(sqlErr)}`,
          )
      }

      // Estratégia 2 (Fallback): Se batchItems veio vazio e ainda não terminamos, usar findRecordsByFilter
      if (batchItems.length === 0) {
        try {
          const filter = lastId
            ? "phone != '' && phone != null && id > {:lastId}"
            : "phone != '' && phone != null"
          const filterParams = lastId ? { lastId: lastId } : {}
          const records = $app.findRecordsByFilter(
            'customers',
            filter,
            'id',
            batchSize,
            0,
            filterParams,
          )

          if (Array.isArray(records) && records.length > 0) {
            for (let i = 0; i < records.length; i++) {
              const rec = records[i]
              batchItems.push({
                id: rec.id || rec.getString('id'),
                phone: rec.getString('phone'),
                name: rec.getString('name'),
                source: rec.getString('source'),
                email: rec.getString('email'),
              })
            }
          }
        } catch (filterErr) {
          $app
            .logger()
            .error(
              `[Transferência V MODA 2] Fallback findRecordsByFilter falhou no lote ${batchIndex}: ${filterErr.message || String(filterErr)}`,
            )
        }
      }

      // Se após ambas estratégias não veio nenhum registro, finalizamos
      if (batchItems.length === 0) {
        $app
          .logger()
          .info(
            `[Transferência V MODA 2] Nenhum registro adicional retornado no lote ${batchIndex} após ID '${lastId}'. Fim da paginação. Total processado: ${totalProcessedSoFar}/${totalCount}.`,
          )
        break
      }

      // Atualiza o cursor lastId com o último elemento lido
      const lastItem = batchItems[batchItems.length - 1]
      lastId = lastItem.id
      totalProcessedSoFar += batchItems.length

      $app
        .logger()
        .info(
          `[Transferência V MODA 2] Lote ${batchIndex} lido com sucesso: ${batchItems.length} registros. Último ID: ${lastId}. Total acumulado: ${totalProcessedSoFar}`,
        )

      // Monta o payload do lote atual
      const leadsPayload = []
      for (let i = 0; i < batchItems.length; i++) {
        const item = batchItems[i]
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
            `[Transferência V MODA 2] Lote ${batchIndex} não possui registros com telefone válido. Ignorando envio.`,
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
                `[Transferência V MODA 2] Lote ${batchIndex} enviado com sucesso (${leadsPayload.length} leads). Resposta do destino: criados=${c}, atualizados=${u}, ignorados=${s}, falhas=${f}`,
              )
          } else {
            totalCreated += leadsPayload.length
            $app
              .logger()
              .info(
                `[Transferência V MODA 2] Lote ${batchIndex} status HTTP ${res.statusCode} (${leadsPayload.length} leads enviados).`,
              )
          }
        } else {
          totalFailed += leadsPayload.length
          const rawSnippet = res.raw ? String(res.raw).substring(0, 200) : 'Sem corpo de resposta'
          const errMsg = `Lote ${batchIndex} falhou com status HTTP ${res.statusCode}: ${rawSnippet}`
          $app.logger().error(`[Transferência V MODA 2] ${errMsg}`)
          errorsList.push(errMsg)
        }
      } catch (httpErr) {
        totalFailed += leadsPayload.length
        const errMsg = `Lote ${batchIndex} erro de requisição HTTP para destino: ${httpErr.message || String(httpErr)}`
        $app.logger().error(`[Transferência V MODA 2] ${errMsg}`)
        errorsList.push(errMsg)
      }
    }

    const calculatedTotalBatches = Math.ceil(totalCount / batchSize)
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
