onRecordAfterCreateSuccess((e) => {
  const record = e.record
  if (record.get('direction') !== 'inbound') return

  const content = (record.get('content') || '').toLowerCase()

  let aiInstructions = ''
  try {
    const settings = $app.findFirstRecordByData('brand_settings', 'key', 'ai_instructions')
    aiInstructions = settings.get('value_text')
  } catch (_) {
    // skip
  }

  let reply = ''

  if ($secrets.has('OPENAI_API_KEY') && aiInstructions) {
    try {
      const res = $http.send({
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + $secrets.get('OPENAI_API_KEY'),
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful wholesale fashion assistant. ' + aiInstructions,
            },
            { role: 'user', content: content },
          ],
          max_tokens: 150,
        }),
        timeout: 15,
      })
      if (res.statusCode === 200 && res.json && res.json.choices && res.json.choices.length > 0) {
        reply = res.json.choices[0].message.content
      }
    } catch (err) {
      console.log('OpenAI API call failed', err)
    }
  }

  if (!reply) {
    if (
      content.includes('coleção') ||
      content.includes('disponível') ||
      content.includes('novidade')
    ) {
      reply =
        'Olá! Sim, nossa nova coleção já está disponível. Posso te enviar o link para você conferir as novidades!'
    } else if (
      content.includes('mínimo') ||
      content.includes('atacado') ||
      content.includes('pedido')
    ) {
      reply = 'Olá! Nosso pedido mínimo no atacado é de 12 peças. Deseja fazer um orçamento?'
    } else if (
      content.includes('prazo') ||
      content.includes('entrega') ||
      content.includes('frete')
    ) {
      reply =
        'O prazo de entrega varia de acordo com o seu CEP. Me informe seu CEP para calcularmos com precisão.'
    } else if (content.includes('problema') || content.includes('defeito')) {
      reply =
        'Sinto muito que tenha tido um problema. Por favor, nos envie uma foto do item para analisarmos o mais rápido possível.'
    } else {
      reply = 'Olá! Como posso ajudar você hoje?'
      if (aiInstructions) {
        reply += ' (Dica IA: ' + aiInstructions.substring(0, 50) + '...)'
      }
    }
  }

  record.set('ai_suggested_reply', reply)
  record.set('status', 'pending')
  $app.save(record)
}, 'messages')
