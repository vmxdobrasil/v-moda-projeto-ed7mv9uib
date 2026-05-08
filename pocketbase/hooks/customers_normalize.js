routerAdd(
  'POST',
  '/backend/v1/customers/normalize',
  (e) => {
    const auth = e.auth
    if (!auth) throw new UnauthorizedError('Faça login para normalizar.')

    const isAdmin =
      auth.getString('role') === 'admin' || auth.getString('email') === 'valterpmendonca@gmail.com'

    let filter = "phone != ''"
    if (!isAdmin) {
      filter = `phone != '' && (manufacturer = '${auth.id}' || affiliate_referrer = '${auth.id}')`
    }

    const customers = $app.findRecordsByFilter('customers', filter, '', 100000, 0)

    let logRecord = null
    try {
      const logsCol = $app.findCollectionByNameOrId('import_logs')
      logRecord = new Record(logsCol)
      logRecord.set('user', auth.id)
      logRecord.set('filename', 'Normalização de Contatos')
      logRecord.set('status', 'processing')
      logRecord.set('total_records', customers.length)
      logRecord.set('processed_records', 0)
      $app.save(logRecord)
    } catch (err) {
      $app.logger().error('Erro ao criar log de normalização', err)
    }

    let count = 0
    let errors = 0
    let processed = 0

    const BATCH_SIZE = 1000
    for (let i = 0; i < customers.length; i += BATCH_SIZE) {
      const batch = customers.slice(i, i + BATCH_SIZE)

      $app.runInTransaction((txApp) => {
        for (const record of batch) {
          let phone = record.getString('phone')
          if (phone) {
            let digits = phone.replace(/\D/g, '')
            let changed = false

            if (digits.length === 10 || digits.length === 11) {
              digits = '55' + digits
              changed = true
            }

            if (digits.startsWith('55') && digits.length === 12) {
              const ddd = digits.substring(2, 4)
              const num = digits.substring(4)
              digits = '55' + ddd + '9' + num
              changed = true
            }

            if (changed || digits !== phone) {
              record.set('phone', digits)
              try {
                txApp.saveNoValidate(record)
                count++
              } catch (err) {
                errors++
              }
            }
          }
          processed++
        }
      })

      if (logRecord) {
        logRecord.set('processed_records', processed)
        try {
          $app.saveNoValidate(logRecord)
        } catch (e) {}
      }
    }

    if (logRecord) {
      logRecord.set('processed_records', processed)
      logRecord.set('status', 'success')
      logRecord.set(
        'error_summary',
        errors > 0 ? `${errors} registros não puderam ser salvos.` : '',
      )
      try {
        $app.saveNoValidate(logRecord)
      } catch (e) {}
    }

    return e.json(200, { count, errors })
  },
  $apis.requireAuth(),
)
