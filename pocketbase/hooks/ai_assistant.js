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
      aiInstructions = 'Você é a VALLEN IA, inteligência comercial nativa do V MODA BRASIL.'
    }

    let userContext = ''
    if (e.auth) {
      const role = e.auth.get('role') || 'desconhecido'
      userContext += `\n\n[CONTEXTO ATUAL]\nPerfil do Usuário: ${role}`

      try {
        if (role === 'manufacturer') {
          const customer = $app.findFirstRecordByData('customers', 'manufacturer', e.auth.id)
          const rank = customer.get('ranking_position')
          if (rank) {
            userContext += `\nRanking da Marca: Posição ${rank} (Top Marcas)`
          }
        }
      } catch (_) {}
    }

    let commissionLogs = ''
    try {
      const logs = $app.findRecordsByFilter('commission_audit_logs', '', '-created', 3, 0)
      if (logs.length > 0) {
        commissionLogs =
          '\nÚltimos logs de auditoria de comissões na plataforma: ' +
          logs.map((l) => `${l.get('new_rate')}%`).join(', ')
      }
    } catch (_) {}

    const systemContent = aiInstructions + userContext + commissionLogs

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
                content: systemContent,
              },
              { role: 'user', content: body.message || '' },
            ],
            max_tokens: 350,
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

    // Simulated AI logic fallback for VALLEN IA
    let reply =
      'Olá! Sou a **VALLEN IA**, a inteligência comercial oficial do V MODA Brasil. Como posso otimizar suas vendas hoje?'

    if (msg.includes('comissão') || msg.includes('taxa')) {
      reply =
        'A nossa estrutura de comissionamento total é de **13,89%**. Ela é dividida em:\n- **2,99% a 3,89%** para o Asaas (gateway de pagamento)\n- **1%** para Influenciadores (se gerarem o lead)\n- **2%** para Guias de Compras/Agentes\n- O saldo para a administração da plataforma.'
    } else if (msg.includes('top') || msg.includes('ranking') || msg.includes('guia vip')) {
      reply =
        'Priorizamos sempre as **TOP 70 Marcas** (Top 15 Feminino, Top 10 Jeans, Top 5 Praia/Fitness, etc.). O Guia VIP dá acesso privilegiado a elas. É um status de alto padrão no atacado!'
    } else if (msg.includes('estoque') || msg.includes('urgência') || msg.includes('escassez')) {
      reply =
        'Atenção: as grades das peças mais vendidas costumam esgotar rápido. Além disso, fique atento aos prazos de envio das excursões para não perder o despacho desta semana!'
    } else if (msg.includes('conteúdo') || msg.includes('stories')) {
      reply =
        'Para converter mais, grave sequências de 15 Stories verticais usando fundo laranja e a logo do V MODA BRASIL. Mostre o caimento da peça para gerar prova social e aumentar o giro!'
    } else if (msg.includes('vídeo') || msg.includes('chamada') || msg.includes('negociar')) {
      reply =
        'Sempre utilize nossa ferramenta interna de negociação por vídeo. Tudo fica registrado no ecossistema V MODA BRASIL, garantindo segurança e transparência na negociação de lotes.'
    }

    return e.json(200, { suggested_reply: reply })
  },
  $apis.requireAuth(),
)
