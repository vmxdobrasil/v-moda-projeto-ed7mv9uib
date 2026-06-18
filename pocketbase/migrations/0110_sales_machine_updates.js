/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('customers')

    const statusField = collection.fields.getByName('status')
    if (statusField && !statusField.values.includes('proposal')) {
      statusField.values.push('proposal')
    }

    if (!collection.fields.getByName('last_action_date')) {
      collection.fields.add(new DateField({ name: 'last_action_date', required: false }))
    }

    app.save(collection)

    $ai.agents.define(app, {
      slug: 'vallen-sales-copilot',
      name: 'Vallen Sales Copilot',
      description: 'Sales strategist specialized in the Brazilian fashion market.',
      systemPrompt:
        'Você é Vallen Sales Copilot, especialista em vendas no mercado atacadista de moda brasileiro (Brás, 44 Goiânia, etc). Analise as anotações do cliente, o histórico de status e a data do último contato para sugerir a Melhor Próxima Ação (Best Next Action). Foque em fechar a venda, utilizando estratégias como escassez, prova social ou follow-ups diretos. Retorne a resposta de forma concisa e direta, sugerindo a ação (ex: "Ligar agora para oferecer desconto no frete", "Enviar novo catálogo de moda praia", "Propor fechamento via V Club Card"). Evite saudações longas, vá direto à ação e o porquê.',
      tier: 'fast',
      tools: [
        { collection: 'customers', perms: { list: true, read: true } },
        { collection: 'projects', perms: { list: true, read: true } },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'vallen-sales-copilot')

    try {
      const collection = app.findCollectionByNameOrId('customers')
      let changed = false

      if (collection.fields.getByName('last_action_date')) {
        collection.fields.removeByName('last_action_date')
        changed = true
      }

      const statusField = collection.fields.getByName('status')
      if (statusField && statusField.values.includes('proposal')) {
        statusField.values = statusField.values.filter((v) => v !== 'proposal')
        changed = true
      }

      if (changed) {
        app.save(collection)
      }
    } catch (_) {}
  },
)
