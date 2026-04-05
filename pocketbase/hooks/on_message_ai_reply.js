onRecordAfterCreateSuccess((e) => {
  const record = e.record
  if (record.get('direction') !== 'inbound') return

  const content = (record.get('content') || '').toLowerCase()
  let reply = 'Olá! Como posso ajudar você hoje?'

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
  }

  record.set('ai_suggested_reply', reply)
  $app.save(record)
}, 'messages')
