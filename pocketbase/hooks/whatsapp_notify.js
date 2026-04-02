routerAdd(
  'POST',
  '/backend/v1/whatsapp/notify/{customerId}',
  (e) => {
    const customerId = e.request.pathValue('customerId')

    let record
    try {
      record = $app.findRecordById('customers', customerId)
    } catch (err) {
      return e.notFoundError('Cliente não encontrado.')
    }

    const phone = record.get('phone')
    if (!phone) {
      return e.badRequestError('Cliente não possui telefone cadastrado.')
    }

    const manufacturerId = record.get('manufacturer')
    if (!manufacturerId) {
      return e.badRequestError('Fabricante inválido.')
    }

    if (!e.hasSuperuserAuth() && e.auth?.id !== manufacturerId) {
      return e.forbiddenError('Sem permissão para notificar este cliente.')
    }

    let config
    try {
      config = $app.findFirstRecordByData('whatsapp_configs', 'user', manufacturerId)
    } catch (err) {
      return e.badRequestError('API do WhatsApp não configurada para este fabricante.')
    }

    const apiUrl = config.get('api_url')
    const token = config.get('token')

    const pos = record.get('ranking_position')
    const cat = record.get('ranking_category') || 'Geral'
    const name = record.get('name') || 'Cliente'

    const msg = `Olá ${name}! Parabéns, você é destaque (TOP ${pos || 'VIP'} em ${cat})! Acesse sua Mini Esteira de Apoio para resgatar sua Revista Digital, E-book e 80% de bônus no ERP/IA. Link: https://v-moda-project-344c0.goskip.app/beneficios`

    try {
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

      if (res.statusCode >= 400) {
        throw new Error(`API retornou ${res.statusCode}`)
      }

      $app
        .db()
        .newQuery('UPDATE customers SET whatsapp_welcome_sent = 1 WHERE id = {:id}')
        .bind({ id: record.id })
        .execute()

      const notif = new Record($app.findCollectionByNameOrId('notifications'))
      notif.set('user', manufacturerId)
      notif.set('customer_email', record.get('email') || '')
      notif.set('title', 'WhatsApp Enviado')
      notif.set('message', `Mensagem de boas-vindas enviada para ${name}.`)
      $app.save(notif)

      return e.json(200, { success: true })
    } catch (err) {
      const notif = new Record($app.findCollectionByNameOrId('notifications'))
      notif.set('user', manufacturerId)
      notif.set('customer_email', record.get('email') || '')
      notif.set('title', 'Erro WhatsApp')
      notif.set(
        'message',
        `Falha ao enviar mensagem para ${name}. Verifique as configurações da API.`,
      )
      $app.save(notif)

      return e.badRequestError(
        'Falha ao enviar a mensagem do WhatsApp. Verifique sua configuração de API.',
      )
    }
  },
  $apis.requireAuth(),
)
