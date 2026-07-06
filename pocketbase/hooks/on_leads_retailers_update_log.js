onRecordAfterUpdateSuccess((e) => {
  const oldStatus = e.record.original().getString('status')
  const newStatus = e.record.getString('status')
  const storeName = e.record.getString('store_name') || e.record.id

  if (oldStatus === newStatus) {
    var oldContact = e.record.original().getString('contact_name')
    var newContact = e.record.getString('contact_name')
    if (oldContact === newContact) return e.next()
  }

  try {
    var col = $app.findCollectionByNameOrId('activity_logs')
    var record = new Record(col)
    var authId = e.requestInfo().auth ? e.requestInfo().auth.id : ''
    if (authId) {
      record.set('user', authId)
    }
    record.set('action_type', 'leads_retailers_updated')
    record.set(
      'description',
      'Lead lojista ' +
        storeName +
        ' atualizado' +
        (oldStatus !== newStatus ? ' — status: ' + oldStatus + ' → ' + newStatus : ''),
    )
    record.set(
      'metadata',
      JSON.stringify({
        leadId: e.record.id,
        storeName: storeName,
        oldStatus: oldStatus,
        newStatus: newStatus,
      }),
    )
    $app.save(record)
  } catch (err) {
    console.log('activity log failed for leads_retailers record ' + e.record.id, err.message)
  }
  return e.next()
}, 'leads_retailers')
