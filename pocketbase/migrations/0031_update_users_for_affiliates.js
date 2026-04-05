migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    users.fields.add(
      new SelectField({
        name: 'role',
        values: ['manufacturer', 'retailer', 'affiliate'],
        maxSelect: 1,
      }),
    )

    users.fields.add(
      new TextField({
        name: 'affiliate_code',
      }),
    )

    app.save(users)

    users.addIndex('idx_users_affiliate_code', false, 'affiliate_code', '')
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('role')
    users.fields.removeByName('affiliate_code')
    users.removeIndex('idx_users_affiliate_code')
    app.save(users)
  },
)
