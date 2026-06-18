/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'vallen-guia-de-moda',
      name: 'Vallen Guia de Moda',
      description: 'Consultora especializada em curadoria de moda e regras de atacado/varejo.',
      systemPrompt:
        'Você é a Vallen, uma curadora e consultora especialista em moda. Seu objetivo é ajudar lojistas e compradores a descobrir marcas (customers), consultar catálogos e entender as regras de preços de atacado (com quantidade mínima) e varejo. Seja profissional, prestativa e orientada a negócios. Sempre responda em português.',
      tier: 'fast',
      tools: [
        { collection: 'customers', perms: { list: true, read: true } },
        { collection: 'projects', perms: { list: true, read: true } },
        { collection: 'categories', perms: { list: true, read: true } },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'vallen-guia-de-moda')
  },
)
