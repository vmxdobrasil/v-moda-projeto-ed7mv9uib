routerAdd('POST', '/backend/v1/referrals/track', (e) => {
  const body = e.requestInfo().body
  const code = body.code
  const brandId = body.brandId
  const type = body.type

  if (!code || !brandId || !type) {
    return e.badRequestError('Missing required fields: code, brandId, type')
  }

  try {
    const user = $app.findFirstRecordByData('users', 'affiliate_code', code)
    const referrals = $app.findCollectionByNameOrId('referrals')

    const record = new Record(referrals)
    record.set('affiliate', user.id)
    record.set('brand', brandId)
    record.set('type', type)
    record.set('metadata', body.metadata || {})

    $app.saveNoValidate(record)
    return e.json(200, { success: true })
  } catch (err) {
    // If the affiliate code is invalid or not found, we fail silently
    // to not break the client application flow
    return e.json(200, { success: false, message: 'Invalid affiliate code or brand' })
  }
})
