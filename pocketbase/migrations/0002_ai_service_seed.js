migrate(
  (app) => {
    try {
      app.findFirstRecordByData('channels', 'name', 'WhatsApp Comercial')
      return // already seeded
    } catch (_) {}

    const channelsCol = app.findCollectionByNameOrId('channels')
    const messagesCol = app.findCollectionByNameOrId('messages')

    const c1 = new Record(channelsCol)
    c1.set('name', 'WhatsApp Comercial')
    c1.set('type', 'whatsapp')
    c1.set('status', true)
    app.save(c1)

    const c2 = new Record(channelsCol)
    c2.set('name', 'Instagram @vmoda')
    c2.set('type', 'instagram')
    c2.set('status', true)
    app.save(c2)

    const c3 = new Record(channelsCol)
    c3.set('name', 'Contato Email')
    c3.set('type', 'email')
    c3.set('status', false)
    app.save(c3)

    const m1 = new Record(messagesCol)
    m1.set('channel', c1.id)
    m1.set('sender_id', '5511999999999')
    m1.set('sender_name', 'Boutique Elegance')
    m1.set('content', 'Olá, gostaria de saber se a nova coleção já está disponível para pedido.')
    m1.set('direction', 'inbound')
    m1.set('status', 'pending')
    app.save(m1)

    const m2 = new Record(messagesCol)
    m2.set('channel', c2.id)
    m2.set('sender_id', 'user_inst_123')
    m2.set('sender_name', 'Studio Moda')
    m2.set('content', 'Qual o pedido mínimo para atacado?')
    m2.set('direction', 'inbound')
    m2.set('status', 'pending')
    app.save(m2)
  },
  (app) => {
    try {
      const c1 = app.findFirstRecordByData('channels', 'name', 'WhatsApp Comercial')
      app.delete(c1)
    } catch (_) {}
  },
)
