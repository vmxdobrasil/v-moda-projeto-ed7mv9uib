routerAdd(
  'POST',
  '/backend/v1/ai-assistant',
  (e) => {
    const body = e.requestInfo().body || {}
    const msg = (body.message || '').toLowerCase()

    // Simulated AI logic for the manufacturer's knowledge base
    let reply = 'Olá! Como posso ajudar você hoje?'

    if (msg.includes('coleção') || msg.includes('disponível') || msg.includes('novidade')) {
      reply =
        'Olá! Sim, nossa nova coleção já está disponível em nosso catálogo. Posso te enviar o link para você conferir as novidades!'
    } else if (msg.includes('mínimo') || msg.includes('atacado') || msg.includes('pedido')) {
      reply =
        'Olá! Nosso pedido mínimo para compras no atacado é de 12 peças, podendo variar os modelos e tamanhos. Deseja fazer um orçamento?'
    } else if (msg.includes('prazo') || msg.includes('entrega') || msg.includes('frete')) {
      reply =
        'O prazo de entrega varia de acordo com o seu CEP, mas em média despachamos em até 48h úteis após a confirmação do pagamento. Me informe seu CEP para calcularmos com precisão.'
    } else if (msg.includes('problema') || msg.includes('defeito')) {
      reply =
        'Sinto muito que tenha tido um problema. Por favor, nos envie uma foto do item para que possamos analisar e providenciar a troca o mais rápido possível.'
    }

    return e.json(200, { suggested_reply: reply })
  },
  $apis.requireAuth(),
)
