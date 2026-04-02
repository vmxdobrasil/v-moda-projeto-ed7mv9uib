migrate(
  (app) => {
    // 1. Add last_contacted_at to customers
    const customersCol = app.findCollectionByNameOrId('customers')
    if (!customersCol.fields.getByName('last_contacted_at')) {
      customersCol.fields.add(new DateField({ name: 'last_contacted_at' }))
    }
    app.save(customersCol)

    // 2. Update whatsapp_templates trigger_event
    const templatesCol = app.findCollectionByNameOrId('whatsapp_templates')
    const triggerField = templatesCol.fields.getByName('trigger_event')
    if (triggerField && !triggerField.values.includes('reactivation_campaign')) {
      triggerField.values.push('reactivation_campaign')
    }
    app.save(templatesCol)

    // 3. Seed template
    try {
      const adminUser = app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')

      try {
        app.findFirstRecordByFilter('whatsapp_templates', "trigger_event = 'reactivation_campaign'")
      } catch (_) {
        const record = new Record(templatesCol)
        record.set('user', adminUser.id)
        record.set('name', 'Campanha de Reativação')
        record.set('trigger_event', 'reactivation_campaign')
        record.set(
          'content',
          'Olá {{name}}, notamos que você ainda não aproveitou seu bônus de 80% na Revista MODA ATUAL. Vamos retomar seu crescimento? Clique aqui: {{benefit_link}}',
        )
        record.set('is_active', true)
        app.save(record)
      }
    } catch (_) {
      // Admin user not found, skip seeding
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByFilter(
        'whatsapp_templates',
        "trigger_event = 'reactivation_campaign'",
      )
      app.delete(record)
    } catch (_) {}

    try {
      const templatesCol = app.findCollectionByNameOrId('whatsapp_templates')
      const triggerField = templatesCol.fields.getByName('trigger_event')
      if (triggerField) {
        triggerField.values = triggerField.values.filter((v) => v !== 'reactivation_campaign')
        app.save(templatesCol)
      }
    } catch (_) {}

    try {
      const customersCol = app.findCollectionByNameOrId('customers')
      customersCol.fields.removeByName('last_contacted_at')
      app.save(customersCol)
    } catch (_) {}
  },
)
