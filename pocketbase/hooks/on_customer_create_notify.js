onRecordCreate((e) => {
  const record = e.record
  let raw = record.getString('phone')
  if (raw) {
    let phone = raw.replace(/\D/g, '')
    if (phone.length === 10) {
      phone = '55' + phone.substring(0, 2) + '9' + phone.substring(2)
    } else if (phone.length === 11 && !phone.startsWith('55')) {
      phone = '55' + phone
    } else if (phone.length === 12 && phone.startsWith('55')) {
      phone = '55' + phone.substring(2, 4) + '9' + phone.substring(4)
    }
    record.set('phone', phone)
  }
  e.next()
}, 'customers')

onRecordUpdate((e) => {
  const record = e.record
  let raw = record.getString('phone')
  if (raw) {
    let phone = raw.replace(/\D/g, '')
    if (phone.length === 10) {
      phone = '55' + phone.substring(0, 2) + '9' + phone.substring(2)
    } else if (phone.length === 11 && !phone.startsWith('55')) {
      phone = '55' + phone
    } else if (phone.length === 12 && phone.startsWith('55')) {
      phone = '55' + phone.substring(2, 4) + '9' + phone.substring(4)
    }
    record.set('phone', phone)
  }
  e.next()
}, 'customers')

onRecordAfterCreateSuccess((e) => {
  const record = e.record
  const collection = $app.findCollectionByNameOrId('notifications')
  const notif = new Record(collection)

  const manufacturerId = record.getString('manufacturer')
  const affiliateId = record.getString('affiliate_referrer')
  let userId = manufacturerId || affiliateId

  if (!userId) {
    try {
      const admin = $app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      userId = admin.id
    } catch (_) {}
  }

  if (userId) {
    notif.set('user', userId)
    notif.set('title', 'Novo Lead Adicionado')
    notif.set(
      'message',
      `Um novo lead (${record.getString('name') || 'Sem Nome'}) foi adicionado à sua base de clientes.`,
    )
    notif.set('read', false)
    $app.save(notif)
  }

  e.next()
}, 'customers')
