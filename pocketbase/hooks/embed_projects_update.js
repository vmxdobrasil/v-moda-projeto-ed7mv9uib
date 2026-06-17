onRecordAfterUpdateSuccess((e) => {
  const nameChanged = e.record.getString('name') !== e.record.original().getString('name')
  const descChanged =
    e.record.getString('description') !== e.record.original().getString('description')

  if (!nameChanged && !descChanged) return e.next()

  const text = (e.record.getString('name') + '\n\n' + e.record.getString('description')).trim()
  if (!text) return e.next()
  try {
    const res = $ai.embed({ input: text })
    const record = $app.findRecordById('projects', e.record.id)
    record.set('embedding', res.data[0].embedding)
    $app.save(record)
  } catch (err) {
    console.log('embedding failed for project ' + e.record.id, err.message)
  }
  return e.next()
}, 'projects')
