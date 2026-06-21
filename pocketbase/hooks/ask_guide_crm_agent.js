routerAdd(
  'POST',
  '/backend/v1/guide-crm/ask',
  (e) => {
    try {
      const userId = e.auth?.id
      if (!userId) return e.unauthorizedError('auth required')

      const body = e.requestInfo().body || {}
      const customerId = body.customer_id

      if (!customerId) return e.badRequestError('customer_id required')

      const customer = $app.findRecordById('customers', customerId)

      const prompt = `Analise o lead ${customer.getString('name')}. Status atual: ${customer.getString('status')}. Origem: ${customer.getString('source')}. Última ação: ${customer.getString('last_action_date')}. 
    Forneça uma análise OODA curta (1 parágrafo) focada em converter este fabricante em parceiro ativo no Guia de Compras. 
    A última linha DEVE ser obrigatoriamente: 'Tarefa Sugerida: [Enviar Proposta | Ligar para o Lead | Enviar Material de Apresentação]'. Escolha apenas uma destas 3 opções com base no contexto.`

      const result = $ai.agent('guide-manufacturer-crm-agent').chat({
        user_id: userId,
        message: prompt,
      })

      return e.json(200, {
        content: result.content,
      })
    } catch (err) {
      if (err instanceof SkipAiError || err instanceof SkipAiAgentsError) {
        return e.json(err.status || 500, { error: err.message })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
