onRecordAfterUpdateSuccess((e) => {
  const oldStatus = e.record.original().getString('status')
  const newStatus = e.record.getString('status')
  const oldName = e.record.original().getString('name')
  const newName = e.record.getString('name')
  const oldCity = e.record.original().getString('city')
  const newCity = e.record.getString('city')

  if (oldStatus === newStatus && oldName === newName && oldCity === newCity) {
    return e.next()
  }

  try {
    var col = $app.findCollectionByNameOrId('activity_logs')
    var record = new Record(col)
    var authId = e.requestInfo().auth ? e.requestInfo().auth.id : ''
    var manufacturerId = e.record.getString('manufacturer') || ''
    if (authId) {
      record.set('user', authId)
    } else if (manufacturerId) {
      record.set('user', manufacturerId)
    }
    record.set('action_type', 'status_update')
    record.set(
      'description',
      'Cliente ' +
        (newName || oldName || e.record.id) +
        ' atualizado' +
        (oldStatus !== newStatus ? ' — status: ' + oldStatus + ' → ' + newStatus : ''),
    )
    record.set(
      'metadata',
      JSON.stringify({
        customerId: e.record.id,
        oldStatus: oldStatus,
        newStatus: newStatus,
        oldName: oldName,
        newName: newName,
      }),
    )
    $app.save(record)
  } catch (err) {
    console.log('activity log failed for customer record ' + e.record.id, err.message)
  }
  return e.next()
}, 'customers')
