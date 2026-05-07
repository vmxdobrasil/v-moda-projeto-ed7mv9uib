routerAdd(
  'POST',
  '/backend/v1/whatsapp/extract-group',
  (e) => {
    const body = e.requestInfo().body
    const instance = body.instance
    const groupId = body.groupId

    const config = $app.findFirstRecordByData('whatsapp_configs', 'user', e.auth.id)
    const apiUrl = config.getString('api_url').replace(/\/$/, '')
    const token = config.getString('token')

    let res
    try {
      res = $http.send({
        url: apiUrl + '/group/findGroupInfos/' + instance + '?groupJid=' + groupId,
        method: 'GET',
        headers: { apikey: token },
        timeout: 15,
      })
    } catch (err) {
      return e.badRequestError('Erro ao comunicar com a Evolution API.')
    }

    if (res.statusCode >= 400) {
      return e.badRequestError('Erro na Evolution API: ' + res.statusCode)
    }

    const groupData = Array.isArray(res.json) ? res.json[0] : res.json
    if (!groupData || !groupData.participants) {
      return e.badRequestError('Grupo não encontrado ou sem participantes.')
    }

    const participants = groupData.participants || []
    const groupName = groupData.subject || 'Grupo Extraído'

    let added = 0
    let skipped = 0

    const customersCol = $app.findCollectionByNameOrId('customers')

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i]
      if (p.admin === 'admin' || p.admin === 'superadmin') {
        skipped++
        continue
      }

      if (!p.id) {
        skipped++
        continue
      }

      const phone = p.id.split('@')[0]

      try {
        $app.findFirstRecordByData('customers', 'phone', phone)
        skipped++
        continue
      } catch (_) {}

      const record = new Record(customersCol)
      record.set('name', 'Lead ' + phone)
      record.set('phone', phone)
      record.set('source', 'whatsapp_group')
      record.set('whatsapp_group_name', groupName)
      record.set('status', 'new')
      record.set('manufacturer', e.auth.id)

      try {
        $app.save(record)
        added++
      } catch (_) {
        skipped++
      }
    }

    try {
      const logsCol = $app.findCollectionByNameOrId('import_logs')
      const logRecord = new Record(logsCol)
      logRecord.set('user', e.auth.id)
      logRecord.set('filename', 'Extrator: ' + groupName)
      logRecord.set('status', 'success')
      logRecord.set('total_records', participants.length)
      logRecord.set('processed_records', added)
      logRecord.set('error_summary', 'Ignorados (admins/duplicados): ' + skipped)
      $app.save(logRecord)
    } catch (err) {
      $app.logger().error('Failed to write import_log', 'error', err.message)
    }

    return e.json(200, { added, skipped, total: participants.length })
  },
  $apis.requireAuth(),
)
