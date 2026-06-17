routerAdd('GET', '/backend/v1/qrcode/{id}', (e) => {
  const id = e.request.pathValue('id')
  let target = null
  let type = null
  let brandId = null
  let affiliateId = null

  // 1. Try Users (Partner: Affiliate / Agent / Manufacturer)
  try {
    const user = $app.findFirstRecordByFilter('users', 'id = {:id} || affiliate_code = {:id}', {
      id: id,
    })
    if (user) {
      const role = user.getString('role')
      if (role === 'affiliate' || role === 'agent') {
        type = 'partner'
        target = '/#/?ref=' + (user.getString('affiliate_code') || user.id)
        affiliateId = user.id
      } else if (role === 'manufacturer') {
        type = 'manufacturer'
        target = '/#/manufacturers?id=' + user.id
      } else {
        type = 'user'
        target = '/#/customers?id=' + user.id
      }
    }
  } catch (_) {}

  // 2. Try Projects (Products)
  if (!target) {
    try {
      const cleanId = id.startsWith('prod_') ? id.replace('prod_', '') : id
      const project = $app.findRecordById('projects', cleanId)
      if (project) {
        type = 'project'
        target = '/#/products?id=' + project.id
      }
    } catch (_) {}
  }

  // 3. Try Customers (Brand Profile)
  if (!target) {
    try {
      const cleanId = id.startsWith('store_') ? id.replace('store_', '') : id
      const customer = $app.findRecordById('customers', cleanId)
      if (customer) {
        type = 'brand'
        target = '/#/manufacturers?id=' + customer.id
        brandId = customer.id
      }
    } catch (_) {}
  }

  let extraData = null

  // 4. Try V-Club Card
  if (!target) {
    try {
      const card = $app.findRecordById('v_club_cards', id)
      if (card) {
        type = 'v_club_card'
        target = '/#/v-club?card=' + card.id

        const customerId = card.getString('customer')
        let customerName = 'Desconhecido'
        let vipLevel = 'unknown'

        if (customerId) {
          try {
            const customer = $app.findRecordById('customers', customerId)
            customerName = customer.getString('name')
            vipLevel = customer.getString('v_club_status')
          } catch (_) {}
        }

        extraData = {
          status: card.getString('status'),
          vip_level: vipLevel,
          customer_name: customerName,
        }
      }
    } catch (_) {}
  }

  // 5. Try V-Club Transaction
  if (!target) {
    try {
      const tx = $app.findFirstRecordByFilter(
        'v_club_transactions',
        'id = {:id} || qr_code_token = {:id}',
        { id: id },
      )
      if (tx) {
        type = 'v_club_transaction'
        target = '/#/v-club?transaction=' + tx.id
        extraData = {
          status: tx.getString('status'),
          amount: tx.getFloat('amount'),
        }
      }
    } catch (_) {}
  }

  // If a valid entity is found, return the redirection target and optionally log the scan
  if (target) {
    // Attempt to log referral click if there is a partner involved (affiliate is required in referrals schema)
    if (affiliateId) {
      try {
        const referrals = $app.findCollectionByNameOrId('referrals')
        const ref = new Record(referrals)
        ref.set('type', 'click')
        ref.set('affiliate', affiliateId)
        if (brandId) ref.set('brand', brandId)
        ref.set('source_channel', 'social_profile')
        ref.set('metadata', JSON.stringify({ qr_code: id, resolved_type: type }))
        $app.save(ref)
      } catch (err) {
        $app.logger().error('Failed to log QR code referral', 'error', err.message, 'qr_code', id)
      }
    }

    return e.json(200, { target: target, type: type, data: extraData })
  }

  return e.notFoundError('QR Code invalid or expired')
})
