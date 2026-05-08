migrate(
  (app) => {
    const records = app.findRecordsByFilter('customers', "phone != ''", '', 100000, 0)
    let updatedCount = 0

    app.runInTransaction((txApp) => {
      for (let i = 0; i < records.length; i++) {
        const record = records[i]
        const rawPhone = record.getString('phone')
        if (!rawPhone) continue

        let phone = rawPhone.replace(/\D/g, '')

        if (phone.length === 10 || phone.length === 11) {
          phone = '55' + phone
        }

        if (phone !== rawPhone) {
          record.set('phone', phone)
          txApp.saveNoValidate(record)
          updatedCount++
        }
      }
    })

    console.log(`Normalized ${updatedCount} customer phone numbers.`)

    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      const importLogsCol = app.findCollectionByNameOrId('import_logs')
      const log = new Record(importLogsCol)
      log.set('user', admin.id)
      log.set('filename', 'migration_0086_normalize_phones')
      log.set('status', 'success')
      log.set('total_records', records.length)
      log.set('processed_records', updatedCount)
      log.set('error_summary', 'Migração de normalização de telefones concluída.')
      app.saveNoValidate(log)
    } catch (e) {
      console.log('Could not create import log: ' + e.message)
    }
  },
  (app) => {
    // Irreversible without original data
  },
)
