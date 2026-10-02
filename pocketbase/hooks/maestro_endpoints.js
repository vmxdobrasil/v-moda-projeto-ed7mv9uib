// Endpoints de leitura e gerenciamento de credencial do Maestro (Adapta)

// GET /backend/v1/leads — últimos leads (com suporte a ?source= e ?limit=)
routerAdd('GET', '/backend/v1/leads', (e) => {
  // Validação de token inline
  const queryToken = (e.request.url.query().get('token') || '').trim()
  const headerAuth = (e.request.header.get('Authorization') || '').trim()
  const headerCustom = (e.request.header.get('x-maestro-token') || '').trim()

  let providedToken = queryToken || headerCustom
  if (!providedToken && headerAuth.startsWith('Bearer ')) {
    providedToken = headerAuth.substring(7).trim()
  } else if (!providedToken && headerAuth) {
    providedToken = headerAuth
  }

  if (!providedToken) {
    return e.json(401, {
      success: false,
      error: 'Token não fornecido. Envie Authorization: Bearer <token>',
    })
  }

  // Verificar se o token foi revogado
  try {
    const statusRec = $app.findFirstRecordByData('brand_settings', 'key', 'maestro_token_status')
    if ((statusRec.getString('value_text') || '').trim() === 'revoked') {
      return e.json(401, {
        success: false,
        error: 'Token do Maestro foi revogado. Gere uma nova credencial no painel AdminMaster.',
      })
    }
  } catch (_) {}

  // Buscar token configurado
  let configuredToken = ''
  try {
    const settingRec = $app.findFirstRecordByData(
      'brand_settings',
      'key',
      'maestro_integration_token',
    )
    configuredToken = (settingRec.getString('value_text') || '').trim()
  } catch (_) {}

  if (!configuredToken || providedToken !== configuredToken) {
    return e.json(401, { success: false, error: 'Token inválido ou expirado.' })
  }

  const query = e.request.url.query()
  const sourceFilter = (query.get('source') || '').trim()
  const limitParam = parseInt(query.get('limit') || '50', 10)
  const limit = Math.max(1, Math.min(200, isNaN(limitParam) ? 50 : limitParam))

  let filter = "id != ''"
  if (sourceFilter) {
    filter = `source = '${sourceFilter.replace(/'/g, "\\'")}'`
  }

  try {
    const records = $app.findRecordsByFilter('customers', filter, '-created', limit, 0)
    const leads = records.map((r) => {
      return {
        id: r.id,
        nome: r.getString('name'),
        name: r.getString('name'),
        phone: r.getString('phone'),
        email: r.getString('email'),
        source: r.getString('source'),
        status: r.getString('status'),
        city: r.getString('city'),
        state: r.getString('state'),
        notes: r.getString('notes'),
        created: r.getString('created'),
        updated: r.getString('updated'),
      }
    })

    return e.json(200, {
      success: true,
      total: leads.length,
      limit: limit,
      filter_source: sourceFilter || null,
      leads: leads,
    })
  } catch (err) {
    return e.json(500, {
      success: false,
      error: 'Erro ao consultar leads: ' + (err.message || String(err)),
    })
  }
})

// GET /backend/v1/leads/count — contagem total e por período (?periodo=hoje|7d|30d)
routerAdd('GET', '/backend/v1/leads/count', (e) => {
  // Validação de token inline
  const queryToken = (e.request.url.query().get('token') || '').trim()
  const headerAuth = (e.request.header.get('Authorization') || '').trim()
  const headerCustom = (e.request.header.get('x-maestro-token') || '').trim()

  let providedToken = queryToken || headerCustom
  if (!providedToken && headerAuth.startsWith('Bearer ')) {
    providedToken = headerAuth.substring(7).trim()
  } else if (!providedToken && headerAuth) {
    providedToken = headerAuth
  }

  if (!providedToken) {
    return e.json(401, {
      success: false,
      error: 'Token não fornecido. Envie Authorization: Bearer <token>',
    })
  }

  // Verificar se o token foi revogado
  try {
    const statusRec = $app.findFirstRecordByData('brand_settings', 'key', 'maestro_token_status')
    if ((statusRec.getString('value_text') || '').trim() === 'revoked') {
      return e.json(401, {
        success: false,
        error: 'Token do Maestro foi revogado. Gere uma nova credencial no painel AdminMaster.',
      })
    }
  } catch (_) {}

  // Buscar token configurado
  let configuredToken = ''
  try {
    const settingRec = $app.findFirstRecordByData(
      'brand_settings',
      'key',
      'maestro_integration_token',
    )
    configuredToken = (settingRec.getString('value_text') || '').trim()
  } catch (_) {}

  if (!configuredToken || providedToken !== configuredToken) {
    return e.json(401, { success: false, error: 'Token inválido ou expirado.' })
  }

  const query = e.request.url.query()
  const periodo = (query.get('periodo') || '').toLowerCase().trim()

  try {
    const totalAll = $app.countRecords('customers')

    const now = new Date()
    let startDate = null

    if (periodo === 'hoje' || periodo === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      startDate = today.toISOString().replace('T', ' ').substring(0, 19)
    } else if (periodo === '7d' || periodo === '7days') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      startDate = past7.toISOString().replace('T', ' ').substring(0, 19)
    } else if (periodo === '30d' || periodo === '30days') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      startDate = past30.toISOString().replace('T', ' ').substring(0, 19)
    }

    let countPeriodo = totalAll
    if (startDate) {
      try {
        const periodRecords = $app.findRecordsByFilter(
          'customers',
          `created >= '${startDate}'`,
          '',
          0,
          0,
        )
        countPeriodo = periodRecords.length
      } catch (_) {
        countPeriodo = 0
      }
    }

    // Contagem por status
    const statusCounts = []
    try {
      $app
        .db()
        .newQuery(
          'SELECT status, COUNT(*) as count FROM customers GROUP BY status ORDER BY count DESC',
        )
        .all(statusCounts)
    } catch (_) {}

    // Contagem por origem
    const sourceCounts = []
    try {
      $app
        .db()
        .newQuery(
          'SELECT source, COUNT(*) as count FROM customers GROUP BY source ORDER BY count DESC',
        )
        .all(sourceCounts)
    } catch (_) {}

    return e.json(200, {
      success: true,
      periodo_solicitado: periodo || 'total',
      count: countPeriodo,
      total_geral: totalAll,
      by_status: statusCounts,
      by_source: sourceCounts,
    })
  } catch (err) {
    return e.json(500, {
      success: false,
      error: 'Erro ao calcular contagem: ' + (err.message || String(err)),
    })
  }
})

// GET /backend/v1/groups — grupos de leads
routerAdd('GET', '/backend/v1/groups', (e) => {
  // Validação de token inline
  const queryToken = (e.request.url.query().get('token') || '').trim()
  const headerAuth = (e.request.header.get('Authorization') || '').trim()
  const headerCustom = (e.request.header.get('x-maestro-token') || '').trim()

  let providedToken = queryToken || headerCustom
  if (!providedToken && headerAuth.startsWith('Bearer ')) {
    providedToken = headerAuth.substring(7).trim()
  } else if (!providedToken && headerAuth) {
    providedToken = headerAuth
  }

  if (!providedToken) {
    return e.json(401, {
      success: false,
      error: 'Token não fornecido. Envie Authorization: Bearer <token>',
    })
  }

  // Verificar se o token foi revogado
  try {
    const statusRec = $app.findFirstRecordByData('brand_settings', 'key', 'maestro_token_status')
    if ((statusRec.getString('value_text') || '').trim() === 'revoked') {
      return e.json(401, {
        success: false,
        error: 'Token do Maestro foi revogado. Gere uma nova credencial no painel AdminMaster.',
      })
    }
  } catch (_) {}

  // Buscar token configurado
  let configuredToken = ''
  try {
    const settingRec = $app.findFirstRecordByData(
      'brand_settings',
      'key',
      'maestro_integration_token',
    )
    configuredToken = (settingRec.getString('value_text') || '').trim()
  } catch (_) {}

  if (!configuredToken || providedToken !== configuredToken) {
    return e.json(401, { success: false, error: 'Token inválido ou expirado.' })
  }

  try {
    const groupRows = []
    $app
      .db()
      .newQuery(
        "SELECT whatsapp_group_name as group_name, COUNT(*) as count, MAX(created) as last_lead_at FROM customers WHERE whatsapp_group_name != '' AND whatsapp_group_name IS NOT NULL GROUP BY whatsapp_group_name ORDER BY count DESC",
      )
      .all(groupRows)

    return e.json(200, {
      success: true,
      total_groups: groupRows.length,
      groups: groupRows.map((g) => ({
        name: g.group_name,
        group_name: g.group_name,
        leads_count: g.count,
        last_lead_at: g.last_lead_at,
      })),
    })
  } catch (err) {
    return e.json(500, {
      success: false,
      error: 'Erro ao listar grupos: ' + (err.message || String(err)),
    })
  }
})

// POST /backend/v1/maestro-token (somente admin autenticado no painel)
// action: "regenerate" | "revoke"
routerAdd(
  'POST',
  '/backend/v1/maestro-token',
  (e) => {
    // 1. Validar autenticação de admin do painel
    const authRecord = e.auth
    if (!authRecord) {
      return e.unauthorizedError('Autenticação necessária. Faça login como administrador.')
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
      return e.forbiddenError('Apenas administradores podem gerenciar o token do Maestro.')
    }

    const body = e.requestInfo().body || {}
    const action = (body.action || '').toLowerCase().trim()

    if (action === 'revoke') {
      try {
        let statusRec = null
        try {
          statusRec = $app.findFirstRecordByData('brand_settings', 'key', 'maestro_token_status')
        } catch (_) {}

        if (statusRec) {
          statusRec.set('value_text', 'revoked')
          $app.save(statusRec)
        } else {
          const bsCol = $app.findCollectionByNameOrId('brand_settings')
          const newRec = new Record(bsCol)
          newRec.set('name', 'Status do Token Maestro')
          newRec.set('key', 'maestro_token_status')
          newRec.set('value_text', 'revoked')
          $app.save(newRec)
        }

        return e.json(200, {
          success: true,
          action: 'revoke',
          status: 'revoked',
          message:
            'Token do Maestro revogado com sucesso. Qualquer requisição futura retornará 401.',
        })
      } catch (err) {
        return e.json(500, {
          success: false,
          error: 'Erro ao revogar token: ' + (err.message || String(err)),
        })
      }
    }

    if (action === 'regenerate') {
      try {
        // Gerar token aleatório seguro de 32 chars com prefixo sk-mst-
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let randomPart = ''
        for (let i = 0; i < 32; i++) {
          randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        const rawToken = 'sk-mst-' + randomPart

        // Atualizar no brand_settings
        let tokenRec = null
        try {
          tokenRec = $app.findFirstRecordByData(
            'brand_settings',
            'key',
            'maestro_integration_token',
          )
        } catch (_) {}

        if (tokenRec) {
          tokenRec.set('value_text', rawToken)
          $app.save(tokenRec)
        } else {
          const bsCol = $app.findCollectionByNameOrId('brand_settings')
          const newRec = new Record(bsCol)
          newRec.set('name', 'Token de Integração Maestro (Adapta)')
          newRec.set('key', 'maestro_integration_token')
          newRec.set('value_text', rawToken)
          $app.save(newRec)
        }

        // Reativar status caso estivesse revogado
        let statusRec = null
        try {
          statusRec = $app.findFirstRecordByData('brand_settings', 'key', 'maestro_token_status')
        } catch (_) {}

        if (statusRec) {
          statusRec.set('value_text', 'active')
          $app.save(statusRec)
        } else {
          const bsCol = $app.findCollectionByNameOrId('brand_settings')
          const newRec = new Record(bsCol)
          newRec.set('name', 'Status do Token Maestro')
          newRec.set('key', 'maestro_token_status')
          newRec.set('value_text', 'active')
          $app.save(newRec)
        }

        // Máscara no formato sk-mst-••••••••XXXX
        const last4 = rawToken.slice(-4)
        const maskedToken = 'sk-mst-••••••••' + last4

        return e.json(200, {
          success: true,
          action: 'regenerate',
          token: rawToken, // Devolvido uma única vez nesta resposta
          masked_token: maskedToken,
          status: 'active',
          message: 'Novo token gerado com sucesso! Guarde-o em segurança.',
        })
      } catch (err) {
        return e.json(500, {
          success: false,
          error: 'Erro ao regenerar token: ' + (err.message || String(err)),
        })
      }
    }

    return e.badRequestError('Ação inválida. Utilize "regenerate" ou "revoke".')
  },
  $apis.requireAuth(),
)
