routerAdd('POST', '/backend/v1/partners/{id}/click', (e) => {
  const id = e.request.pathValue('id')
  try {
    const record = $app.findRecordById('customers', id)
    const currentClicks = record.getInt('whatsapp_clicks') || 0
    record.set('whatsapp_clicks', currentClicks + 1)
    $app.saveNoValidate(record)
    return e.json(200, { success: true, clicks: currentClicks + 1 })
  } catch (err) {
    return e.notFoundError('Customer not found')
  }
})
