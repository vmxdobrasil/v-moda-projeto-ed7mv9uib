/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')

    const statusField = customers.fields.getByName('status')
    if (statusField && statusField.type === 'select') {
      const newStatuses = [
        'retail_interesse',
        'retail_cotacao',
        'retail_pedido',
        'retail_pagamento',
        'retail_entrega',
        'cons_potencial',
        'cons_atendimento',
        'cons_pedido',
        'cons_pagamento',
        'cons_entrega',
        'mgmt_interesse',
        'mgmt_proposta',
        'mgmt_negociacao',
        'mgmt_fechamento',
        'mgmt_pos_venda',
      ]
      const existing = statusField.values || []
      statusField.values = Array.from(new Set([...existing, ...newStatuses]))
    }
    app.save(customers)

    $ai.agents.define(app, {
      slug: 'retail-strategist',
      name: 'Retail Strategist',
      description: 'Estrategista para varejistas.',
      systemPrompt:
        'Você é um estrategista de varejo atuando na plataforma V MODA. Analise as informações de compras, sugira marcas com melhores margens e alertas de reposição. Responda usando a estrutura OODA (Observe, Orient, Decide, Act).',
      tier: 'reasoning',
      tools: [
        { collection: 'customers', perms: { read: true, list: true } },
        { collection: 'projects', perms: { read: true, list: true } },
      ],
    })

    $ai.agents.define(app, {
      slug: 'career-mentor',
      name: 'Career Mentor',
      description: 'Mentor de carreira para consultoras de moda.',
      systemPrompt:
        'Você é um mentor de carreira para consultoras de moda. Analise as vendas, sugira oportunidades de upsell/cross-sell e dê dicas para alcançar o próximo nível de consultora. Responda usando a estrutura OODA (Observe, Orient, Decide, Act).',
      tier: 'fast',
      tools: [{ collection: 'customers', perms: { read: true, list: true, update: true } }],
    })

    $ai.agents.define(app, {
      slug: 'inventory-manager',
      name: 'Inventory Manager',
      description: 'Gerente de estoque e vendas para fabricantes.',
      systemPrompt:
        'Você é um gerente de estoque estratégico para fabricantes de moda. Monitore produtos e leads para sugerir ajustes de preço e priorização estratégica de vendas. Responda usando a estrutura OODA (Observe, Orient, Decide, Act).',
      tier: 'fast',
      tools: [
        { collection: 'projects', perms: { read: true, list: true, update: true } },
        { collection: 'customers', perms: { read: true, list: true, update: true } },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'retail-strategist')
    $ai.agents.delete(app, 'career-mentor')
    $ai.agents.delete(app, 'inventory-manager')
  },
)
