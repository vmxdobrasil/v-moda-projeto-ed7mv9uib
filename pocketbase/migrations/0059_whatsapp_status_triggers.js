migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('whatsapp_templates')
    const field = col.fields.getByName('trigger_event')
    field.selectValues = [
      'welcome_message',
      'ranking_promotion',
      'benefit_alert',
      'reactivation_campaign',
      'status_interested',
      'status_negotiating',
      'status_converted',
      'status_inactive',
    ]
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('whatsapp_templates')
    const field = col.fields.getByName('trigger_event')
    field.selectValues = [
      'welcome_message',
      'ranking_promotion',
      'benefit_alert',
      'reactivation_campaign',
    ]
    app.save(col)
  },
)
