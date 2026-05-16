onRecordAfterCreateSuccess((e) => {
  const record = e.record
  if (record.get('direction') !== 'inbound') return

  const content = (record.get('content') || '').toLowerCase()

  let aiInstructions = ''
  try {
    const settings = $app.findFirstRecordByData('brand_settings', 'key', 'ai_system_instructions')
    aiInstructions = settings.get('value_text')
  } catch (_) {
    aiInstructions = 'Você é a VALLEN IA, inteligência comercial oficial do V MODA Brasil.'
  }

  let templatesContext = ''
  try {
    const templates = $app.findRecordsByFilter('whatsapp_templates', 'is_active = true', '', 10, 0)
    if (templates.length > 0) {
      templatesContext = '\n[TEMPLATES REFERÊNCIA]\n'
      templates.forEach((t) => {
        templatesContext += `- ${t.getString('trigger_event')}: ${t.getString('content')}\n`
      })
    }
  } catch (_) {}

  let catalogContext = ''
  try {
    const projects = $app.findRecordsByFilter('projects', 'price > 0', '-created', 5, 0)
    if (projects.length > 0) {
      catalogContext = '\n[DESTAQUES CATÁLOGO - Escassez]\n'
      projects.forEach((p) => {
        catalogContext += `- ${p.getString('name')}: Varejo R$ ${p.getFloat('price')} / Atacado R$ ${p.getFloat('wholesale_price')}\n`
      })
    }
  } catch (_) {}

  let userContext = ''
  try {
    const senderId = record.getString('sender_id')
    const user = $app.findRecordById('users', senderId)
    const role = user.get('role') || 'desconhecido'
    userContext = `\n[CONTEXTO DO USUÁRIO]\nPapel: ${role}`
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
              content: `${aiInstructions}${templatesContext}${catalogContext}${userContext}`,
            },
            { role: 'user', content: record.get('content') },
          ],
          max_tokens: 300,
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
    if (content.includes('comissão') || content.includes('taxa')) {
      reply =
        'Nossa comissão total é de **13,89%**, que inclui o gateway Asaas (2,99% a 3,89%), 1% para influenciadores e 2% para guias. É um modelo sustentável para alavancar seu atacado!'
    } else if (
      content.includes('urgente') ||
      content.includes('estoque') ||
      content.includes('grade')
    ) {
      reply =
        'Cuidado com a ruptura de estoque! As excursões têm prazos rígidos. Recomendo fechar seu lote agora para garantir disponibilidade nas melhores peças.'
    } else if (content.includes('top') || content.includes('marcas') || content.includes('vip')) {
      reply =
        'Com o Guia VIP você acessa o ranking das **TOP 70 Marcas** de Goiás, garantindo peças com alto giro e ótimo markup direto dos fabricantes premium.'
    } else {
      reply =
        'Olá! Sou a **VALLEN IA**, inteligência comercial do V MODA Brasil. Estou aqui para otimizar suas negociações no atacado. Como posso ajudar?'
    }
  }

  record.set('ai_suggested_reply', reply)
  record.set('status', 'pending')
  $app.save(record)
}, 'messages')
