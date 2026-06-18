migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    users.fields.add(
      new SelectField({
        name: 'brand_role',
        values: ['ceo', 'manager', 'salesperson'],
        maxSelect: 1,
      }),
    )

    users.fields.add(
      new RelationField({
        name: 'parent_brand',
        collectionId: '_pb_users_auth_',
        maxSelect: 1,
      }),
    )

    users.fields.add(
      new SelectField({
        name: 'segment_tier',
        values: ['retail', 'fashion_consultant', 'exclusive_consultant', 'premium_consultant'],
        maxSelect: 1,
      }),
    )

    users.fields.add(
      new TextField({
        name: 'phone',
      }),
    )

    users.fields.add(
      new TextField({
        name: 'instagram',
      }),
    )

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('brand_role')
    users.fields.removeByName('parent_brand')
    users.fields.removeByName('segment_tier')
    users.fields.removeByName('phone')
    users.fields.removeByName('instagram')
    app.save(users)
  },
)
