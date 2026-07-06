onRecordAfterUpdateSuccess((e) => {
  const oldStatus = e.record.original().getString('status')
  const newStatus = e.record.getString('status')
  if (oldStatus === newStatus) return e.next()

  try {
    const col = $app.findCollectionByNameOrId('activity_logs')
    const record = new Record(col)
    const manufacturerId = e.record.getString('manufacturer') || ''
    if (manufacturerId) record.set('user', manufacturerId)
    record.set('action_type', 'lead_updated')
    record.set(
      'description',
      'Status do lead ' +
        e.record.getString('name') +
        ' alterado de ' +
        oldStatus +
        ' para ' +
        newStatus,
    )
    record.set(
      'metadata',
      JSON.stringify({ customerId: e.record.id, oldStatus: oldStatus, newStatus: newStatus }),
    )
    $app.save(record)
  } catch (err) {
    console.log('activity log failed for record ' + e.record.id, err.message)
  }
  return e.next()
}, 'customers')
