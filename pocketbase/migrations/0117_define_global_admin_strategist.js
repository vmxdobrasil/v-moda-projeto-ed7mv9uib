/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'global-admin-strategist',
      name: 'Estrategista V MODA',
      description: 'Consultor estratégico global para análise do ecossistema V MODA BRASIL.',
      systemPrompt:
        'Você é um consultor estratégico de nível gerencial do V MODA BRASIL. Sua função é analisar dados de funil de vendas, exclusividade territorial, limites de crédito do V Club e tendências regionais. Baseie-se apenas nos dados fornecidos. Sugira ações estratégicas como upsell, cross-sell, ativação de agentes em regiões promissoras ou bloqueios de crédito. Use sempre um tom profissional, direto e baseado em dados.',
      tier: 'fast',
      tools: [
        { collection: 'customers', perms: { list: true, read: true }, actAs: 'admin' },
        { collection: 'users', perms: { list: true, read: true }, actAs: 'admin' },
        { collection: 'v_club_cards', perms: { list: true, read: true }, actAs: 'admin' },
        { collection: 'v_club_transactions', perms: { list: true, read: true }, actAs: 'admin' },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'global-admin-strategist')
  },
)
