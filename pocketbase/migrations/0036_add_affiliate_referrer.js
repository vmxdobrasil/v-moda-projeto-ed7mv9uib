migrate(
  (app) => {
    const authCol = app.findCollectionByNameOrId('users')
    const col = app.findCollectionByNameOrId('customers')
    if (!col.fields.getByName('affiliate_referrer')) {
      col.fields.add(
        new RelationField({ name: 'affiliate_referrer', collectionId: authCol.id, maxSelect: 1 }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('customers')
    col.fields.removeByName('affiliate_referrer')
    app.save(col)
  },
)
