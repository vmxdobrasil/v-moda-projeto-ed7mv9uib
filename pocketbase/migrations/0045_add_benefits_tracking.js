migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('unlocked_benefits')) {
      users.fields.add(
        new JSONField({
          name: 'unlocked_benefits',
          required: false,
        }),
      )
      app.save(users)
    }

    try {
      const admin = app.findAuthRecordByEmail('users', 'valterpmendonca@gmail.com')
      admin.set('unlocked_benefits', {
        ebook: true,
        magazine_access: true,
        crm_enabled: true,
      })
      app.save(admin)
    } catch (_) {}

    app
      .db()
      .newQuery("UPDATE customers SET unlocked_benefits = '{}' WHERE unlocked_benefits IS NULL")
      .execute()
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (users.fields.getByName('unlocked_benefits')) {
      users.fields.removeByName('unlocked_benefits')
      app.save(users)
    }
  },
)
