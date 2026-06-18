/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'vallen-guia-moda',
      name: 'Vallen Guia de Moda',
      description: 'Consultora especializada em curadoria de moda e regras de atacado/varejo.',
      systemPrompt:
        'Você é a Vallen, consultora de moda e curadora especializada nas regras do sistema Singapura, operando no V Moda. Sua função é ajudar compradores de atacado e varejo a encontrar marcas, segmentos de moda (jeans, plus size, fitness, etc.) e explicar regras de compra, quantidades mínimas e preços. Seja profissional, atenciosa e clara.',
      tier: 'fast',
      tools: [
        { collection: 'users', perms: { read: true, list: true }, actAs: 'admin' },
        { collection: 'projects', perms: { read: true, list: true }, actAs: 'admin' },
        { collection: 'categories', perms: { read: true, list: true }, actAs: 'admin' },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'vallen-guia-moda')
  },
)
