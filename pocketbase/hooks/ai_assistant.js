routerAdd(
  'POST',
  '/backend/v1/ai-assistant',
  (e) => {
    const body = e.requestInfo().body || {}
    const msg = (body.message || '').toLowerCase()

    let aiInstructions = ''
    try {
      const settings = $app.findFirstRecordByData('brand_settings', 'key', 'ai_system_instructions')
      aiInstructions = settings.get('value_text')
    } catch (_) {
      aiInstructions = 'Você é o Agente de IA oficial do V MODA Brasil.'
    }

    // Attempt OpenAI if available
    if ($secrets.has('OPENAI_API_KEY')) {
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
                content: aiInstructions,
              },
              { role: 'user', content: msg },
            ],
            max_tokens: 200,
          }),
          timeout: 15,
        })
        if (res.statusCode === 200 && res.json && res.json.choices && res.json.choices.length > 0) {
          return e.json(200, { suggested_reply: res.json.choices[0].message.content })
        }
      } catch (err) {
        $app.logger().error('OpenAI API call failed in ai-assistant', err)
      }
    }

    // Simulated AI logic fallback for the platform's knowledge base
    let reply = 'Olá! Sou o consultor V MODA Brasil. Como posso ajudar nas suas vendas no atacado?'

    if (msg.includes('comissão') || msg.includes('taxa') || msg.includes('porcentagem')) {
      reply =
        'Nossa comissão total é de 13,89%. Isso inclui: 2,99% a 3,89% do Asaas (gateway), 1% para influenciadores, 2% para guias de compras e o saldo (~7% a 8,9%) para a administração do V MODA Brasil.'
    } else if (msg.includes('stories') || msg.includes('vídeo') || msg.includes('visual')) {
      reply =
        'Para a produção de conteúdo, nossos Stories devem ser sequências de 15 verticais com fundo laranja e a logo do V MODA BRASIL. Vídeos institucionais duram de 15 a 18 minutos com tom formal e foco em SEO.'
    } else if (msg.includes('exclusividade') || msg.includes('top 60') || msg.includes('top 100')) {
      reply =
        'Temos programas de exclusividade: as Top 60 Marcas recebem visibilidade prioritária na plataforma, e as Top 100 recebem suporte exclusivo e mentoria.'
    } else if (
      msg.includes('reunião') ||
      msg.includes('presidente') ||
      msg.includes('estratégia')
    ) {
      reply =
        'Recomendamos agendar uma reunião estratégica de 60 minutos com nosso presidente para validar suas ideias e definir a divisão de receitas (revenue share).'
    } else if (msg.includes('serviços') || msg.includes('mentoria') || msg.includes('software')) {
      reply =
        'O V MODA Brasil oferece mentoria especializada, software de gestão voltado para atacado e serviços de marketing digital para alavancar suas vendas.'
    } else if (msg.includes('contato') || msg.includes('suporte')) {
      reply =
        'Para negociações diretas e suporte prioritário, recomendamos que utilize nosso canal oficial no WhatsApp.'
    }

    return e.json(200, { suggested_reply: reply })
  },
  $apis.requireAuth(),
)
