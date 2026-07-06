routerAdd(
  'POST',
  '/backend/v1/admin/notifications',
  (e) => {
    const body = e.requestInfo().body || {}
    if (!body.title || !body.message) {
      return e.badRequestError('title and message are required')
    }

    const collection = $app.findCollectionByNameOrId('notifications')
    const record = new Record(collection)
    record.set('title', body.title)
    record.set('message', body.message)
    record.set('read', false)
    if (body.user) record.set('user', body.user)
    if (body.customer_email) record.set('customer_email', body.customer_email)
    $app.save(record)

    return e.json(201, { id: record.id, title: record.getString('title') })
  },
  $apis.requireAuth(),
)
