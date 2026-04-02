onRecordAfterUpdateSuccess((e) => {
  const record = e.record
  const pos = record.get('ranking_position')
  const phone = record.get('phone')
  const sent = record.get('whatsapp_welcome_sent')

  if (!phone || pos > 15 || pos < 1 || sent) {
    e.next()
    return
  }

  const manufacturerId = record.get('manufacturer')
  if (!manufacturerId) {
    e.next()
    return
  }

  try {
    const config = $app.findFirstRecordByData('whatsapp_configs', 'user', manufacturerId)
    const apiUrl = config.get('api_url')
    const token = config.get('token')

    const cat = record.get('ranking_category') || 'Geral'
    const name = record.get('name') || 'Cliente'

    const msg = `Olá ${name}! Parabéns, você alcançou o TOP ${pos} na categoria ${cat}! Acesse sua Mini Esteira de Apoio para resgatar sua Revista Digital, E-book e 80% de bônus no ERP/IA. Link: https://v-moda-project-344c0.goskip.app/beneficios`

    const res = $http.send({
      url: apiUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        phone: phone,
        message: msg,
      }),
      timeout: 10,
    })

    if (res.statusCode < 400) {
      $app
        .db()
        .newQuery('UPDATE customers SET whatsapp_welcome_sent = 1 WHERE id = {:id}')
        .bind({ id: record.id })
        .execute()

      const notif = new Record($app.findCollectionByNameOrId('notifications'))
      notif.set('user', manufacturerId)
      notif.set('customer_email', record.get('email') || '')
      notif.set('title', 'WhatsApp Enviado (Automático)')
      notif.set('message', `Mensagem de ranking automático enviada para ${name}.`)
      $app.save(notif)
    } else {
      throw new Error(`Status ${res.statusCode}`)
    }
  } catch (err) {
    try {
      const notif = new Record($app.findCollectionByNameOrId('notifications'))
      notif.set('user', manufacturerId)
      notif.set('customer_email', record.get('email') || '')
      notif.set('title', 'Erro WhatsApp (Automático)')
      notif.set(
        'message',
        `Falha ao notificar ${record.get('name') || 'Cliente'} sobre o novo ranking.`,
      )
      $app.save(notif)
    } catch (e2) {}
  }

  e.next()
}, 'customers')
