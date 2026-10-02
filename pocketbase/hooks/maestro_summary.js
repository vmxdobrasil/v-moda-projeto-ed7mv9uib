routerAdd('GET', '/backend/v1/maestro/summary', (e) => {
  // 1. Obter o token fornecido via query param (?token=...), header Authorization (Bearer <token>) ou header x-maestro-token
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
      error:
        'Token do Maestro não fornecido. Envie via header x-maestro-token, Authorization: Bearer <token> ou ?token=<token>',
    })
  }

  // 2. Buscar o token configurado em brand_settings
  let configuredToken = ''
  try {
    const settingRec = $app.findFirstRecordByData(
      'brand_settings',
      'key',
      'maestro_integration_token',
    )
    configuredToken = (settingRec.getString('value_text') || '').trim()
  } catch (_) {
    // Record não existe ainda
  }

  if (!configuredToken) {
    return e.json(503, {
      success: false,
      error: 'Token de integração do Maestro ainda não foi inicializado no painel AdminMaster.',
    })
  }

  // 3. Validar token
  if (providedToken !== configuredToken) {
    return e.json(403, {
      success: false,
      error: 'Token do Maestro inválido ou expirado.',
    })
  }

  // 4. Calcular estatísticas de leitura para o Maestro (CRM, WhatsApp, Catálogo)
  try {
    const totalCustomers = $app.countRecords('customers')

    var statusCounts = []
    $app
      .db()
      .newQuery(
        'SELECT status, COUNT(*) as count FROM customers GROUP BY status ORDER BY count DESC',
      )
      .all(statusCounts)

    var topCities = []
    $app
      .db()
      .newQuery(
        "SELECT city, state, COUNT(*) as count FROM customers WHERE city != '' GROUP BY city, state ORDER BY count DESC LIMIT 5",
      )
      .all(topCities)

    var groupsCountModel = new DynamicModel({ total: 0 })
    try {
      $app
        .db()
        .newQuery(
          "SELECT COUNT(DISTINCT whatsapp_group_name) as total FROM customers WHERE whatsapp_group_name != ''",
        )
        .one(groupsCountModel)
    } catch (_) {}

    var totalProjects = 0
    try {
      totalProjects = $app.countRecords('projects')
    } catch (_) {}

    var totalOrders = 0
    try {
      totalOrders = $app.countRecords('orders')
    } catch (_) {}

    const totalLeadsVenda = $app.countRecords('leads_venda')
    const totalLeadsRetailers = $app.countRecords('leads_retailers')
    const totalLeadsFabricantes = $app.countRecords('leads_fabricantes')

    // 5. Retornar JSON rico e amigável para o Maestro (Adapta) interpretar e resumir para o usuário
    return e.json(200, {
      success: true,
      project: 'V MODA BRASIL',
      timestamp: new Date().toISOString(),
      summary: {
        crm: {
          total_customers_leads: totalCustomers,
          by_status: statusCounts,
          top_cities: topCities,
          unique_whatsapp_groups: groupsCountModel.total || 0,
        },
        pipeline_and_b2b: {
          leads_venda: totalLeadsVenda,
          leads_retailers: totalLeadsRetailers,
          leads_fabricantes: totalLeadsFabricantes,
        },
        catalog: {
          active_products: totalProjects,
        },
        orders: {
          total_orders: totalOrders,
        },
      },
      webhook_endpoints: {
        inbound_leads: '/backend/v1/n8n-webhook',
        method: 'POST',
        accepted_payload_example: {
          leads: [
            {
              phone: '5562999999999',
              name: 'Maria Vendedora',
              source: 'maestro_adapta',
            },
          ],
        },
      },
    })
  } catch (err) {
    return e.json(500, {
      success: false,
      error: 'Erro ao compilar resumo para o Maestro: ' + (err.message || String(err)),
    })
  }
})
