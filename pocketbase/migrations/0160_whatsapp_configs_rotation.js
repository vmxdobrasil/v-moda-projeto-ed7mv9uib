migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('whatsapp_configs')

    if (!col.fields.getByName('label')) {
      col.fields.add(new TextField({ name: 'label' }))
    }
    if (!col.fields.getByName('phone_number')) {
      col.fields.add(new TextField({ name: 'phone_number' }))
    }
    if (!col.fields.getByName('is_active')) {
      col.fields.add(new BoolField({ name: 'is_active' }))
    }
    if (!col.fields.getByName('throttle_interval_sec')) {
      col.fields.add(new NumberField({ name: 'throttle_interval_sec', min: 1, max: 300 }))
    }
    if (!col.fields.getByName('last_used_at')) {
      col.fields.add(new DateField({ name: 'last_used_at' }))
    }

    app.save(col)

    // Preenche valores padrão para os registros existentes
    app
      .db()
      .newQuery(`
      UPDATE whatsapp_configs
      SET is_active = 1
      WHERE is_active IS NULL
    `)
      .execute()

    app
      .db()
      .newQuery(`
      UPDATE whatsapp_configs
      SET throttle_interval_sec = 8
      WHERE throttle_interval_sec IS NULL OR throttle_interval_sec = 0
    `)
      .execute()

    app
      .db()
      .newQuery(`
      UPDATE whatsapp_configs
      SET label = 'Número Principal (' || COALESCE(instance_id, 'Instância') || ')'
      WHERE label IS NULL OR label = ''
    `)
      .execute()
  },
  (app) => {
    const col = app.findCollectionByNameOrId('whatsapp_configs')
    if (col.fields.getByName('label')) col.fields.removeByName('label')
    if (col.fields.getByName('phone_number')) col.fields.removeByName('phone_number')
    if (col.fields.getByName('is_active')) col.fields.removeByName('is_active')
    if (col.fields.getByName('throttle_interval_sec'))
      col.fields.removeByName('throttle_interval_sec')
    if (col.fields.getByName('last_used_at')) col.fields.removeByName('last_used_at')
    app.save(col)
  },
)
