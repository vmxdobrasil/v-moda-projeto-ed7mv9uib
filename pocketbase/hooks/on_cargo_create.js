onRecordAfterCreateSuccess((e) => {
  const record = e.record
  if (!record.getString('qr_code_token')) {
    try {
      const token = $security.randomString(32)
      const cargo = $app.findRecordById('cargas_transporte', record.id)
      cargo.set('qr_code_token', token)
      $app.save(cargo)
    } catch (err) {
      $app
        .logger()
        .error('Failed to generate QR token for cargo', 'error', err.message, 'cargo_id', record.id)
    }
  }
  return e.next()
}, 'cargas_transporte')
