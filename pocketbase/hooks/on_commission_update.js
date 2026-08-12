onRecordUpdateRequest((e) => {
  const original = e.record.original()
  const body = e.requestInfo().body || {}

  if (body.commission_rate !== undefined) {
    const oldRate = original.getFloat('commission_rate')
    const newRate = parseFloat(body.commission_rate)
    const role = original.getString('role')

    if (oldRate !== newRate && (role === 'affiliate' || role === 'agent')) {
      const adminId = e.auth?.id
      if (adminId) {
        const auditCol = $app.findCollectionByNameOrId('commission_audit_logs')
        const auditRecord = new Record(auditCol)
        auditRecord.set('admin_user', adminId)
        auditRecord.set('target_partner', e.record.id)
        auditRecord.set('previous_rate', oldRate)
        auditRecord.set('new_rate', newRate)
        $app.save(auditRecord)
      }

      try {
        const adminNotifCol = $app.findCollectionByNameOrId('notifications')
        const adminNotif = new Record(adminNotifCol)
        adminNotif.set('title', 'Comissão atualizada')
        adminNotif.set(
          'message',
          'A comissão do parceiro foi alterada de ' + oldRate + '% para ' + newRate + '%.',
        )
        adminNotif.set('read', false)
        $app.save(adminNotif)
      } catch (adminErr) {
        $app.logger().error('Failed to create admin notification', 'error', adminErr.message)
      }
    }
  }
  e.next()
}, 'users')
