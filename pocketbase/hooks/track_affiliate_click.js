routerAdd('POST', '/backend/v1/affiliate/track-click', (e) => {
  const body = e.requestInfo().body || {}
  const code = body.affiliate_code || ''
  const targetUrl = body.target_url || ''
  const shortCode = body.short_code || ''

  if (!code) return e.badRequestError('affiliate_code is required')

  try {
    const user = $app.findFirstRecordByData('users', 'affiliate_code', code)

    if (shortCode) {
      try {
        const link = $app.findFirstRecordByData('links_rastreio', 'short_code', shortCode)
        const currentClicks = link.getInt('clicks') || 0
        link.set('clicks', currentClicks + 1)
        $app.saveNoValidate(link)
      } catch (_) {}
    }

    const referrals = $app.findCollectionByNameOrId('referrals')
    const record = new Record(referrals)
    record.set('affiliate', user.id)
    record.set('type', 'click')
    record.set('metadata', { target_url: targetUrl, short_code: shortCode })
    $app.saveNoValidate(record)

    return e.json(200, { success: true })
  } catch (err) {
    return e.json(200, { success: false, message: 'Invalid affiliate code' })
  }
})
