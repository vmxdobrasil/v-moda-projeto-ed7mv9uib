routerAdd(
  'POST',
  '/backend/v1/import/check-reimport',
  (e) => {
    const body = e.requestInfo().body || {}
    const filename = (body.filename || '').toLowerCase().trim()
    const userId = e.auth && e.auth.id

    if (!filename || !userId) {
      return e.json(200, { isReimport: false })
    }

    try {
      var safeFilename = filename.replace(/'/g, "''")
      var records = $app.findRecordsByFilter(
        'import_logs',
        "user = '" + userId + "' && filename = '" + safeFilename + "'",
        '-created',
        1,
        0,
      )
      if (records.length > 0) {
        return e.json(200, {
          isReimport: true,
          previousImport: {
            id: records[0].id,
            filename: records[0].getString('filename'),
            status: records[0].getString('status'),
            created: records[0].getString('created'),
          },
        })
      }
    } catch (_) {}

    return e.json(200, { isReimport: false })
  },
  $apis.requireAuth(),
)
