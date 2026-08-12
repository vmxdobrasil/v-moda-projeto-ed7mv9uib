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

  try {
    const adminNotifCol = $app.findCollectionByNameOrId('notifications')
    const adminNotif = new Record(adminNotifCol)
    adminNotif.set('title', 'Nova carga criada')
    adminNotif.set('message', 'Uma nova carga de transporte foi criada. ID: ' + record.id)
    adminNotif.set('read', false)
    $app.save(adminNotif)
  } catch (adminErr) {
    $app.logger().error('Failed to create admin notification', 'error', adminErr.message)
  }

  return e.next()
}, 'cargas_transporte')
