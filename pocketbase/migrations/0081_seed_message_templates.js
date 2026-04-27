migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('message_templates')
    const templates = [
      {
        name: 'Zoop Pitch - Email',
        content:
          'Olá {{name}},\n\nSegue em anexo a proposta estratégica de parceria entre a V MODA Brasil e a Zoop.\n\nFicamos à disposição para agendar uma reunião de alinhamento.\n\nAtenciosamente,\nEquipe V MODA Brasil',
        channel_type: 'email',
        category: 'initial_pitch',
      },
      {
        name: 'Zoop Pitch - WhatsApp',
        content:
          'Olá {{name}}! 🚀\n\nTemos uma proposta estratégica de parceria entre a V MODA Brasil e a Zoop que vai revolucionar o mercado atacadista.\n\nDá uma olhada no resumo e vamos agendar um bate-papo!',
        channel_type: 'whatsapp',
        category: 'initial_pitch',
      },
      {
        name: 'Zoop Pitch - Instagram',
        content:
          'Olá {{name}}! 🚀 Temos uma proposta estratégica incrível entre a V MODA Brasil e a Zoop. Gostaria de apresentar os detalhes. Podemos agendar uma call?',
        channel_type: 'instagram',
        category: 'initial_pitch',
      },
    ]
    for (const t of templates) {
      try {
        app.findFirstRecordByData('message_templates', 'name', t.name)
      } catch (_) {
        const record = new Record(col)
        record.set('name', t.name)
        record.set('content', t.content)
        record.set('channel_type', t.channel_type)
        record.set('category', t.category)
        app.save(record)
      }
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('message_templates')
    const templates = ['Zoop Pitch - Email', 'Zoop Pitch - WhatsApp', 'Zoop Pitch - Instagram']
    for (const name of templates) {
      try {
        const rec = app.findFirstRecordByData('message_templates', 'name', name)
        app.delete(rec)
      } catch (_) {}
    }
  },
)
