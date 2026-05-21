routerAdd('POST', '/backend/v1/vallen-chat', (e) => {
  const body = e.requestInfo().body || {}
  const messages = body.messages || []
  const context = body.context || 'general'

  if (!Array.isArray(messages)) {
    return e.badRequestError('O campo messages deve ser um array.')
  }

  if (messages.length > 50) {
    return e.badRequestError('Limite de mensagens excedido para esta sessão.')
  }

  let aiInstructions =
    'Você é a VALLEN IA, assistente virtual da V MODA BRASIL. Responda em português de forma concisa e amigável.'

  try {
    const brandSettings = $app.findRecordsByFilter(
      'brand_settings',
      "key = 'ai_instructions'",
      '',
      1,
      0,
    )
    if (brandSettings.length > 0) {
      const text = brandSettings[0].getString('value_text')
      if (text) {
        aiInstructions = text
      }
    }
  } catch (err) {
    // Fallback to default if not found
  }

  if (context === 'guest_login_page' || context === 'guest') {
    aiInstructions +=
      ' O usuário atualmente é um visitante ou está na página de login e não está autenticado. Ajude-o com dúvidas gerais sobre a plataforma, benefícios, ou como criar uma conta e fazer login.'
  }

  const gatewayUrl = $secrets.get('SKIP_AI_GATEWAY_URL')
  const gatewayKey = $secrets.get('SKIP_AI_GATEWAY_API_KEY')

  if (!gatewayUrl || !gatewayKey) {
    $app
      .logger()
      .warn('SKIP_AI_GATEWAY_URL or SKIP_AI_GATEWAY_API_KEY not set. Using fallback response.')
    return e.json(200, {
      reply:
        'Olá! No momento os serviços de IA estão em manutenção, mas sinta-se à vontade para navegar ou fazer login na V MODA BRASIL.',
    })
  }

  try {
    const url = gatewayUrl.endsWith('/') ? gatewayUrl.slice(0, -1) : gatewayUrl

    const payloadMessages = [{ role: 'system', content: aiInstructions }, ...messages]

    const res = $http.send({
      url: url + '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + gatewayKey,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: payloadMessages,
      }),
      timeout: 30,
    })

    if (
      res.statusCode >= 200 &&
      res.statusCode < 300 &&
      res.json &&
      res.json.choices &&
      res.json.choices.length > 0
    ) {
      return e.json(200, { reply: res.json.choices[0].message.content })
    } else {
      $app.logger().error('AI Gateway error', 'status', res.statusCode, 'body', res.json)
      return e.json(500, {
        reply: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.',
      })
    }
  } catch (err) {
    $app.logger().error('AI Gateway request failed', err)
    return e.json(500, {
      reply:
        'Desculpe, a rede está instável no momento e não pude responder. Tente novamente em alguns instantes.',
    })
  }
})
