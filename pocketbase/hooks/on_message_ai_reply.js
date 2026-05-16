onRecordAfterCreateSuccess((e) => {
  const record = e.record
  if (record.get('direction') !== 'inbound') return

  const content = (record.get('content') || '').toLowerCase()

  let aiInstructions = ''
  try {
    const settings = $app.findFirstRecordByData('brand_settings', 'key', 'ai_system_instructions')
    aiInstructions = settings.get('value_text')
  } catch (_) {
    try {
      const settings = $app.findFirstRecordByData('brand_settings', 'key', 'ai_instructions')
      aiInstructions = settings.get('value_text')
    } catch (__) {
      aiInstructions =
        'Você é um especialista em moda atacado do V MODA Brasil. Responda de forma educada e consultiva.'
    }
  }

  let templatesContext = ''
  try {
    const templates = $app.findRecordsByFilter('whatsapp_templates', 'is_active = true', '', 10, 0)
    if (templates.length > 0) {
      templatesContext =
        'Você possui os seguintes templates/mensagens como referência de estilo e ofertas:\n'
      templates.forEach((t) => {
        templatesContext += `- ${t.getString('trigger_event')}: ${t.getString('content')}\n`
      })
    }
  } catch (_) {}

  let catalogContext = ''
  try {
    const projects = $app.findRecordsByFilter('projects', 'price > 0', '-created', 10, 0)
    if (projects.length > 0) {
      catalogContext = 'Produtos em destaque no catálogo:\n'
      projects.forEach((p) => {
        catalogContext += `- ${p.getString('name')}: Preço R$ ${p.getFloat('price')} / Atacado R$ ${p.getFloat('wholesale_price')}\n`
      })
    }
  } catch (_) {}

  let reply = ''

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
              content: `You are a helpful wholesale fashion assistant. ${aiInstructions}\n\n${templatesContext}\n\n${catalogContext}`,
            },
            { role: 'user', content: content },
          ],
          max_tokens: 200,
        }),
        timeout: 15,
      })
      if (res.statusCode === 200 && res.json && res.json.choices && res.json.choices.length > 0) {
        reply = res.json.choices[0].message.content
      }
    } catch (err) {
      $app.logger().error('OpenAI API call failed', err)
    }
  }

  if (!reply) {
    if (
      content.includes('comissão') ||
      content.includes('taxa') ||
      content.includes('porcentagem')
    ) {
      reply =
        'Nossa comissão total é de 13,89%. Isso inclui: 2,99% a 3,89% do Asaas (gateway), 1% para influenciadores, 2% para guias de compras e o saldo (~7% a 8,9%) para a administração do V MODA Brasil.'
    } else if (
      content.includes('stories') ||
      content.includes('vídeo') ||
      content.includes('visual')
    ) {
      reply =
        'Para a produção de conteúdo, nossos Stories devem ser sequências de 15 verticais com fundo laranja e a logo do V MODA BRASIL. Vídeos institucionais duram de 15 a 18 minutos com tom formal e foco em SEO.'
    } else if (
      content.includes('exclusividade') ||
      content.includes('top 60') ||
      content.includes('top 100')
    ) {
      reply =
        'Temos programas de exclusividade: as Top 60 Marcas recebem visibilidade prioritária na plataforma, e as Top 100 recebem suporte exclusivo e mentoria.'
    } else if (
      content.includes('reunião') ||
      content.includes('presidente') ||
      content.includes('estratégia')
    ) {
      reply =
        'Recomendamos agendar uma reunião estratégica de 60 minutos com nosso presidente para validar suas ideias e definir a divisão de receitas (revenue share).'
    } else if (
      content.includes('serviços') ||
      content.includes('mentoria') ||
      content.includes('software')
    ) {
      reply =
        'O V MODA Brasil oferece mentoria especializada, software de gestão voltado para atacado e serviços de marketing digital para alavancar suas vendas.'
    } else if (content.includes('contato') || content.includes('suporte')) {
      reply =
        'Para negociações diretas e suporte prioritário, recomendamos que utilize nosso canal oficial no WhatsApp.'
    } else {
      reply = 'Olá! Sou o consultor V MODA Brasil. Como posso ajudar nas suas vendas no atacado?'
    }
  }

  record.set('ai_suggested_reply', reply)
  record.set('status', 'pending')
  $app.save(record)
}, 'messages')
