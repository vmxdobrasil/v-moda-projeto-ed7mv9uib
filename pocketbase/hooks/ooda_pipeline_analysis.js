routerAdd(
  'POST',
  '/backend/v1/ooda-pipeline-analysis',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Auth required')
    const body = e.requestInfo().body || {}

    const prompt = `Você é o Assistente Estratégico OODA do V MODA BRASIL.
Analise os clientes no funil de vendas do fabricante e sugira a próxima ação tática com foco nos mais prioritários (data de ação antiga, alto valor, ou próximos da data de entrega).
Retorne um resumo direto e acionável.

Pipeline:
${JSON.stringify(
  body.pipeline?.map((c) => ({
    nome: c.name,
    status: c.status,
    valor_estimado: c.estimated_value,
    ultima_acao: c.last_action_date || c.updated,
    data_entrega: c.shipping_date,
  })) || [],
)}
`

    const reply = $ai.chat({
      model: 'reasoning',
      messages: [{ role: 'system', content: prompt }],
    })

    return e.json(200, { suggestion: reply.choices[0].message.content })
  },
  $apis.requireAuth(),
)
