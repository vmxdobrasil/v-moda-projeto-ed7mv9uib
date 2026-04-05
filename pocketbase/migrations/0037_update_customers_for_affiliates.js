migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('customers')

    col.listRule =
      "@request.auth.id != '' && (manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id)"
    col.viewRule =
      "@request.auth.id != '' && (manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id)"
    col.createRule =
      "@request.auth.id != '' && (manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id)"
    col.updateRule =
      "@request.auth.id != '' && (manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id)"
    col.deleteRule =
      "@request.auth.id != '' && (manufacturer = @request.auth.id || affiliate_referrer = @request.auth.id)"

    const mfgField = col.fields.getByName('manufacturer')
    if (mfgField) {
      mfgField.required = false
    }

    const sourceField = col.fields.getByName('source')
    if (sourceField) {
      const values = sourceField.values || []
      if (!values.includes('whatsapp_group')) values.push('whatsapp_group')
      if (!values.includes('social_profile')) values.push('social_profile')
      sourceField.values = values
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')

    col.listRule = "@request.auth.id != '' && manufacturer = @request.auth.id"
    col.viewRule = "@request.auth.id != '' && manufacturer = @request.auth.id"
    col.createRule = "@request.auth.id != '' && manufacturer = @request.auth.id"
    col.updateRule = "@request.auth.id != '' && manufacturer = @request.auth.id"
    col.deleteRule = "@request.auth.id != '' && manufacturer = @request.auth.id"

    const mfgField = col.fields.getByName('manufacturer')
    if (mfgField) {
      mfgField.required = true
    }

    const sourceField = col.fields.getByName('source')
    if (sourceField) {
      sourceField.values = sourceField.values.filter(
        (v) => v !== 'whatsapp_group' && v !== 'social_profile',
      )
    }

    app.save(col)
  },
)
