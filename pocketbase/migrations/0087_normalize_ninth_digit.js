migrate(
  (app) => {
    const customers = app.findRecordsByFilter('customers', 'phone != ""', '', 100000, 0)

    app.runInTransaction((txApp) => {
      for (let i = 0; i < customers.length; i++) {
        const record = customers[i]
        const raw = record.getString('phone')
        let phone = raw.replace(/\D/g, '')

        let changed = false
        if (phone.length === 10) {
          phone = '55' + phone.substring(0, 2) + '9' + phone.substring(2)
          changed = true
        } else if (phone.length === 11 && !phone.startsWith('55')) {
          phone = '55' + phone
          changed = true
        } else if (phone.length === 12 && phone.startsWith('55')) {
          phone = '55' + phone.substring(2, 4) + '9' + phone.substring(4)
          changed = true
        }

        if (changed || phone !== raw) {
          record.set('phone', phone)
          txApp.saveNoValidate(record)
        }
      }
    })
  },
  (app) => {
    // Cannot easily be reversed without losing the original formatting differences.
  },
)
