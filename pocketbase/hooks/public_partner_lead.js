routerAdd('POST', '/backend/v1/partners/lead', (e) => {
  const body = e.requestInfo().body
  if (!body.manufacturer) return e.badRequestError('Missing manufacturer')
  if (!body.name) return e.badRequestError('Missing name')
  if (!body.email) return e.badRequestError('Missing email')

  const notifications = $app.findCollectionByNameOrId('notifications')
  const record = new Record(notifications)

  record.set('user', body.manufacturer)
  record.set('title', `New Lead Interest: ${body.partnerName || 'Partner'}`)
  record.set('message', `Name: ${body.name}\nEmail: ${body.email}\nInterest: ${body.message || ''}`)
  record.set('customer_email', body.email)
  record.set('read', false)

  $app.save(record)

  return e.json(200, { success: true })
})
