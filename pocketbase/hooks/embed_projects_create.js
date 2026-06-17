onRecordAfterCreateSuccess((e) => {
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
