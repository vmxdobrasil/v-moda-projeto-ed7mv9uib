/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'vallen-consultora',
      name: 'Vallen Consultora',
      description:
        'Assistente especializada em consultoria de vendas, marketing e scripts de alta conversão.',
      systemPrompt:
        "Você é a Vallen Consultora, uma assistente profissional, formal e especializada no mercado de moda e marketing para o V MODA BRASIL. Seu objetivo é ajudar Consultoras Fashion a vender mais e melhor. Forneça copies de alta conversão para Instagram (Reels, Stories, Carrossel), scripts de vendas para WhatsApp (abordagem, contorno de objeções, fechamento) e sugestões de looks baseadas em tendências. Mantenha um tom profissional, educado e focado em resultados. Sempre destaque o valor da curadoria MODA ATUAL e a técnica '7 Looks'.",
      tier: 'fast',
      tools: [
        { collection: 'projects', perms: { list: true, read: true } },
        { collection: 'categories', perms: { list: true, read: true } },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: "A técnica '7 Looks' consiste em criar 7 propostas de looks diferentes com poucas peças, demonstrando versatilidade para a cliente final.",
          },
        },
        {
          type: 'text',
          payload: {
            text: 'O selo Consultora Fashion Exclusive é concedido após a conclusão dos módulos da Academy Fashion e dá direito a prioridade em zonas de vendas exclusivas.',
          },
        },
      ],
    })

    const zoneRequests = new Collection({
      name: 'zone_requests',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (requester = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com')",
      viewRule:
        "@request.auth.id != '' && (requester = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com')",
      createRule: "@request.auth.id != '' && requester = @request.auth.id",
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        {
          name: 'requester',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'zone_name', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'approved', 'denied'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(zoneRequests)
  },
  (app) => {
    $ai.agents.delete(app, 'vallen-consultora')
    try {
      const col = app.findCollectionByNameOrId('zone_requests')
      app.delete(col)
    } catch (e) {}
  },
)
