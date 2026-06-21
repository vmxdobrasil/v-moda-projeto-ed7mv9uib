/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'guide-manufacturer-crm-agent',
      name: 'Guia CRM Agent',
      description: 'Assistente OODA para conversão de fabricantes no Guia de Compras.',
      systemPrompt:
        "Você é um assistente estratégico OODA (Observe, Orient, Decide, Act) focado em converter fabricantes de moda em parceiros ativos no Guia de Compras. Analise o contexto do lead e sugira a próxima melhor ação. Ao final, recomende uma tarefa específica que deve ser escolhida desta lista: 'Enviar Proposta', 'Ligar para o Lead' ou 'Enviar Material de Apresentação'.",
      tier: 'fast',
      tools: [
        {
          collection: 'customers',
          perms: { read: true, list: true, update: true },
          actAs: 'admin',
        },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'guide-manufacturer-crm-agent')
  },
)
