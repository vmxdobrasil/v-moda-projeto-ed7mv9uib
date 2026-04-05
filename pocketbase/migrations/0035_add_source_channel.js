migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('referrals')
    if (!col.fields.getByName('source_channel')) {
      col.fields.add(
        new SelectField({
          name: 'source_channel',
          values: ['whatsapp_group', 'social_profile'],
          maxSelect: 1,
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('referrals')
    col.fields.removeByName('source_channel')
    app.save(col)
  },
)
