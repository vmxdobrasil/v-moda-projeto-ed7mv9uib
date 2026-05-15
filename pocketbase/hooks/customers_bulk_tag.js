// @deps
routerAdd(
  'POST',
  '/backend/v1/customers/bulk-tag',
  (e) => {
    const body = e.requestInfo().body || {}
    const ids = body.ids || []
    const excludedIds = body.excludedIds || []
    let filter = body.filter || ''
    const tags = body.tags || []
    const operation = body.operation || 'add' // "add" or "remove"

    if (!Array.isArray(tags) || tags.length === 0) {
      return e.badRequestError('Nenhuma tag fornecida.')
    }

    let records = []
    if (Array.isArray(ids) && ids.length > 0) {
      if (ids.length > 10000) {
        return e.badRequestError(
          'Muitos IDs selecionados manualmente. Use a seleção total (filtro).',
        )
      }
      const placeholders = ids.map((_, i) => `{:id${i}}`).join(',')
      const bindings = {}
      ids.forEach((id, i) => {
        bindings[`id${i}`] = id
      })

      records = $app.findRecordsByFilter(
        'customers',
        `id IN (${placeholders})`,
        '',
        100000,
        0,
        bindings,
      )
    } else if (filter || body.selectAll) {
      if (Array.isArray(excludedIds) && excludedIds.length > 0) {
        const bindings = {}
        const exclusions = excludedIds
          .map((id, i) => {
            bindings[`ex${i}`] = id
            return `id != {:ex${i}}`
          })
          .join(' && ')
        filter = filter ? `(${filter}) && (${exclusions})` : exclusions
        records = $app.findRecordsByFilter(
          'customers',
          filter || "id != ''",
          '',
          100000,
          0,
          bindings,
        )
      } else {
        records = $app.findRecordsByFilter('customers', filter || "id != ''", '', 100000, 0)
      }
    } else {
      return e.badRequestError("Nenhum cliente selecionado (forneça 'ids' ou 'filter').")
    }

    const isSuperuser = e.hasSuperuserAuth()
    let updatedCount = 0

    $app.runInTransaction((txApp) => {
      for (const record of records) {
        if (!isSuperuser) {
          if (!$app.canAccessRecord(record, e.requestInfo(), record.collection().updateRule)) {
            continue
          }
        }

        let currentTags = record.get('tags')
        if (typeof currentTags === 'string' && currentTags.trim() !== '') {
          try {
            currentTags = JSON.parse(currentTags)
          } catch (err) {
            currentTags = []
          }
        }
        if (!Array.isArray(currentTags)) {
          currentTags = []
        }

        let changed = false
        if (operation === 'add') {
          for (const tag of tags) {
            if (!currentTags.includes(tag)) {
              currentTags.push(tag)
              changed = true
            }
          }
        } else if (operation === 'remove') {
          const oldLen = currentTags.length
          currentTags = currentTags.filter((t) => !tags.includes(t))
          if (currentTags.length !== oldLen) changed = true
        }

        if (changed) {
          record.set('tags', currentTags)
          txApp.saveNoValidate(record)
          updatedCount++
        }
      }
    })

    return e.json(200, { updatedCount })
  },
  $apis.requireAuth(),
)
