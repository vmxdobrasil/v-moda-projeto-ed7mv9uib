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

    let templateContent = null
    let templateActive = true
    try {
      const tpl = $app.findFirstRecordByFilter(
        'whatsapp_templates',
        'user = {:user} && trigger_event = "welcome_message"',
        { user: manufacturerId },
      )
      templateContent = tpl.get('content')
      templateActive = tpl.get('is_active')
    } catch (err) {}

    if (!templateActive) {
      return e.badRequestError('Envio de mensagens de boas-vindas está desativado.')
    }

    const pos = record.get('ranking_position') || 'VIP'
    const cat = record.get('ranking_category') || 'Geral'
    const name = record.get('name') || 'Cliente'
    const zone = record.get('exclusivity_zone') || ''
    const link = 'https://v-moda-project-344c0.goskip.app/beneficios'

    let msg = `Olá ${name}! Parabéns, você é destaque (TOP ${pos} em ${cat})! Acesse sua Mini Esteira de Apoio para resgatar sua Revista Digital, E-book e 80% de bônus no ERP/IA. Link: ${link}`

    if (templateContent) {
      msg = templateContent
        .replace(/\{\{name\}\}/g, name)
        .replace(/\{\{ranking\}\}/g, pos)
        .replace(/\{\{category\}\}/g, cat)
        .replace(/\{\{zone\}\}/g, zone)
        .replace(/\{\{benefit_link\}\}/g, link)
    }

    try {
      const sendResult = $whatsappRotator.sendWithRotation({
        userId: manufacturerId,
        phone: phone,
        message: msg,
      })

      if (!sendResult.success) {
        throw new Error(sendResult.error || 'Falha no envio via rodízio')
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
      notif.set(
        'message',
        `Mensagem de boas-vindas enviada para ${name} via ${sendResult.label || sendResult.instance}.`,
      )
      $app.save(notif)

      return e.json(200, {
        success: true,
        sent_via: sendResult.instance,
        label: sendResult.label,
      })
    } catch (err) {
      const notif = new Record($app.findCollectionByNameOrId('notifications'))
      notif.set('user', manufacturerId)
      notif.set('customer_email', record.get('email') || '')
      notif.set('title', 'Erro WhatsApp')
      notif.set('message', `Falha ao enviar mensagem para ${name}: ${err.message}`)
      $app.save(notif)

      return e.badRequestError('Falha ao enviar a mensagem do WhatsApp: ' + err.message)
    }
  },
  $apis.requireAuth(),
)
