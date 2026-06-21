routerAdd(
  'POST',
  '/backend/v1/ooda/whatsapp-analysis',
  (e) => {
    const body = e.requestInfo().body || {}
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')

    const customerId = body.customer_id
    if (!customerId) return e.badRequestError('customer_id is required')

    const customer = $app.findRecordById('customers', customerId)

    const manufacturerId = customer.getString('manufacturer') || userId
    const templates = $app.findRecordsByFilter(
      'whatsapp_templates',
      "is_active = true && user = '" + manufacturerId + "'",
      '',
      10,
      0,
    )

    const templateContext =
      templates.length > 0
        ? templates
            .map(
              (t) =>
                '- [' +
                t.getString('trigger_event') +
                '] ' +
                t.getString('name') +
                ': ' +
                t.getString('content'),
            )
            .join('\n')
        : '(Nenhum template cadastrado)'

    const lastActionStr = customer.getString('last_action_date') || customer.getString('updated')
    const daysInactive = Math.floor(
      (Date.now() - new Date(lastActionStr).getTime()) / (1000 * 3600 * 24),
    )
    let adaColor = 'Verde'
    if (daysInactive > 7 && daysInactive <= 15) adaColor = 'Amarelo'
    if (daysInactive > 15) adaColor = 'Vermelho'

    const prompt = `Analise o lead ${customer.getString('name')}.
Status CRM: ${customer.getString('status')}
Origem (Source): ${customer.getString('source')}
Cliques no WhatsApp: ${customer.getInt('whatsapp_clicks')}
Dias Inativo: ${daysInactive} dias (Cor ADA: ${adaColor})

Como OODA Agent, sugira a melhor ação imediata no WhatsApp para avançar este lead.
Recomende o uso de um destes templates caso se aplique ao contexto e momento (cite o nome do template):
${templateContext}

Seja assertivo, estratégico e limite sua resposta a no máximo 4 linhas.`

    try {
      const result = $ai.agent('vallen-sales-copilot').chat({
        user_id: userId,
        message: prompt,
      })
      return e.json(200, { content: result.content })
    } catch (err) {
      if (err.status) {
        return e.json(err.status, { error: err.message })
      }
      return e.internalServerError('AI agent error')
    }
  },
  $apis.requireAuth(),
)
