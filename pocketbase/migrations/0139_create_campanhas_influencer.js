migrate(
  (app) => {
    const collection = new Collection({
      name: 'campanhas_influencer',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com' || affiliate = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com' || affiliate = @request.auth.id)",
      createRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        {
          name: 'affiliate',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'coupon_code', type: 'text', required: true },
        { name: 'discount_percent', type: 'number', required: true },
        { name: 'is_active', type: 'bool', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_campanhas_inf_code ON campanhas_influencer (coupon_code)',
        'CREATE INDEX idx_campanhas_inf_affiliate ON campanhas_influencer (affiliate)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('campanhas_influencer'))
    } catch (_) {}
  },
)
