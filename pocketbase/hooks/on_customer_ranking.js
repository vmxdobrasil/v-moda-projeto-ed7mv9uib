onRecordAfterUpdateSuccess((e) => {
  const record = e.record
  const original = e.original

  const email = record.get('email')
  const phone = record.get('phone')
  const category = record.get('ranking_category')
  const position = record.get('ranking_position')
  const isExclusive = record.get('is_exclusive')

  const oldCategory = original ? original.get('ranking_category') : ''
  const oldPosition = original ? original.get('ranking_position') : 0
  const oldExclusive = original ? original.get('is_exclusive') : false

  const rankingChanged =
    category && position > 0 && (category !== oldCategory || position !== oldPosition)
  const exclusiveChanged = isExclusive && !oldExclusive

  if (rankingChanged || exclusiveChanged) {
    const title = 'Novo Ranking Alcançado!'
    const msg = `Parabéns! Você agora faz parte do TOP ${position} da categoria ${category.replace('_', ' ')} da Revista MODA ATUAL.`

    if (email && rankingChanged) {
      try {
        $app.findFirstRecordByFilter(
          'notifications',
          'customer_email = {:email} AND title = {:title} AND message = {:msg}',
          {
            email: email,
            title: title,
            msg: msg,
          },
        )
      } catch (_) {
        const notif = new Record($app.findCollectionByNameOrId('notifications'))
        notif.set('customer_email', email)
        notif.set('user', record.get('manufacturer'))
        notif.set('title', title)
        notif.set('message', msg)
        notif.set('read', false)
        $app.save(notif)
      }
    }

    if (phone && rankingChanged) {
      try {
        const channel = $app.findFirstRecordByData('channels', 'type', 'whatsapp')
        const message = new Record($app.findCollectionByNameOrId('messages'))
        message.set('channel', channel.id)
        message.set('sender_id', phone)
        message.set('sender_name', record.get('name') || 'Revendedor')
        message.set('content', msg)
        message.set('direction', 'outbound')
        message.set('status', 'pending')
        $app.save(message)
      } catch (err) {
        console.log('Error sending whatsapp notification or no channel found:', err)
      }
    }
  }

  e.next()
}, 'customers')
