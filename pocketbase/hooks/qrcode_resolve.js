routerAdd('GET', '/backend/v1/qrcode/{id}', (e) => {
  const id = e.request.pathValue('id')
  let target = null
  let type = null
  let brandId = null
  let affiliateId = null

  // 1. Try Users (Partner: Affiliate / Agent)
  try {
    const user = $app.findFirstRecordByFilter('users', 'id = {:id} || affiliate_code = {:id}', {
      id: id,
    })
    if (user && (user.getString('role') === 'affiliate' || user.getString('role') === 'agent')) {
      type = 'partner'
      target = '/?ref=' + (user.getString('affiliate_code') || user.id)
      affiliateId = user.id
    }
  } catch (_) {}

  // 2. Try Projects
  if (!target) {
    try {
      const cleanId = id.startsWith('prod_') ? id.replace('prod_', '') : id
      const project = $app.findRecordById('projects', cleanId)
      if (project) {
        type = 'project'
        target = '/products/' + project.id
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
        target = '/manufacturers/' + customer.id
        brandId = customer.id
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

    return e.json(200, { target: target, type: type })
  }

  return e.notFoundError('QR Code invalid or expired')
})
