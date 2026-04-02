onRecordAfterUpdateSuccess((e) => {
  const record = e.record

  const email = record.get('email')
  const category = record.get('ranking_category')
  const position = record.get('ranking_position')

  if (email && category && position > 0) {
    try {
      $app.findFirstRecordByFilter(
        'notifications',
        'customer_email = {:email} AND title = {:title}',
        {
          email: email,
          title: 'Novo Ranking Alcançado!',
        },
      )
    } catch (_) {
      const notif = new Record($app.findCollectionByNameOrId('notifications'))
      notif.set('customer_email', email)
      notif.set('user', record.get('manufacturer'))
      notif.set('title', 'Novo Ranking Alcançado!')
      notif.set(
        'message',
        `Parabéns! Você agora faz parte do TOP ${position} da categoria ${category.replace('_', ' ')} da Revista MODA ATUAL.`,
      )
      notif.set('read', false)
      $app.save(notif)
    }
  }

  e.next()
}, 'customers')
