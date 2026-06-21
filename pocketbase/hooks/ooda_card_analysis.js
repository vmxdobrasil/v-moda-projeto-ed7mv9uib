routerAdd(
  'POST',
  '/backend/v1/ooda-card-analysis',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Auth required')
    const body = e.requestInfo().body || {}

    const c = body.customer || {}

    const prompt = `Você é o AI Sales Agent do V MODA BRASIL.
Analise a oportunidade de venda atual deste cliente específico e sugira UMA ação específica curta e direta (máximo de 15 palavras).
Exemplos: "Enviar follow-up agora", "Oferecer 5% de desconto", "Agendar videochamada".

Dados do cliente:
Nome: ${c.name}
Status: ${c.status}
Valor Estimado: R$ ${c.estimated_value || 0}
Última Ação: ${c.last_action_date || c.updated}
Data de Entrega: ${c.shipping_date || 'N/A'}
`

    const reply = $ai.chat({
      model: 'fast',
      messages: [{ role: 'system', content: prompt }],
    })

    return e.json(200, { suggestion: reply.choices[0].message.content })
  },
  $apis.requireAuth(),
)
