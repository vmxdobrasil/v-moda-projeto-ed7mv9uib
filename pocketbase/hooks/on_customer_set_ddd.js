onRecordAfterCreateSuccess((e) => {
  const phone = e.record.getString('phone')
  if (!phone) return e.next()
  const digits = phone.replace(/\D/g, '')
  let ddd = ''
  let normalized = digits
  if (normalized.startsWith('55') && normalized.length > 11) {
    normalized = normalized.substring(2)
  }
  if (normalized.length >= 10) {
    ddd = normalized.substring(0, 2)
  } else if (normalized.length >= 2) {
    ddd = normalized.substring(0, 2)
  }
  if (ddd && ddd !== e.record.getString('ddd')) {
    try {
      const record = $app.findRecordById('customers', e.record.id)
      record.set('ddd', ddd)
      $app.saveNoValidate(record)
    } catch (err) {
      $app.logger().error('Failed to set DDD', 'recordId', e.record.id, 'error', err.message)
    }
  }
  return e.next()
}, 'customers')

onRecordAfterUpdateSuccess((e) => {
  const phoneChanged = e.record.getString('phone') !== e.record.original().getString('phone')
  if (!phoneChanged) return e.next()
  const phone = e.record.getString('phone')
  if (!phone) return e.next()
  const digits = phone.replace(/\D/g, '')
  let ddd = ''
  let normalized = digits
  if (normalized.startsWith('55') && normalized.length > 11) {
    normalized = normalized.substring(2)
  }
  if (normalized.length >= 10) {
    ddd = normalized.substring(0, 2)
  } else if (normalized.length >= 2) {
    ddd = normalized.substring(0, 2)
  }
  if (ddd && ddd !== e.record.getString('ddd')) {
    try {
      const record = $app.findRecordById('customers', e.record.id)
      record.set('ddd', ddd)
      $app.saveNoValidate(record)
    } catch (err) {
      $app.logger().error('Failed to update DDD', 'recordId', e.record.id, 'error', err.message)
    }
  }
  return e.next()
}, 'customers')
