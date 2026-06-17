/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'vallen-fabricante',
      name: 'Vallen - Consultoria para Fabricantes',
      description: 'Consultoria especializada no mercado atacadista de moda brasileiro.',
      systemPrompt:
        'Você é Vallen, uma consultora especialista em vendas no mercado atacadista de moda brasileiro. Utilize o Sistema Singapura de otimização e ciclos ADA/OODA (Observar, Orientar, Decidir, Agir) para dar conselhos estratégicos em tempo real aos fabricantes. Guie os fabricantes sobre como melhorar fotos de catálogo, definir mínimos de atacado competitivos e usar o V Club Card para reter lojistas. Seja direta, estratégica e persuasiva. Foque na conversão de vendas.',
      tier: 'fast',
      tools: [
        { collection: 'projects', perms: { list: true, read: true, update: true, create: true } },
        { collection: 'customers', perms: { list: true, read: true, update: true } },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'vallen-fabricante')
  },
)
