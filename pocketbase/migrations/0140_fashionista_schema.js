migrate(
  (app) => {
    // 1. Add 'fashionista' to the role select on users
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const roleField = users.fields.getByName('role')
    if (roleField) {
      const values = roleField.values || []
      if (!values.includes('fashionista')) {
        roleField.values = [...values, 'fashionista']
      }
    }
    app.save(users)

    // 2. Add order_type to orders collection
    const orders = app.findCollectionByNameOrId('orders')
    if (!orders.fields.getByName('order_type')) {
      orders.fields.add(
        new SelectField({
          name: 'order_type',
          values: ['retail', 'wholesale'],
          maxSelect: 1,
        }),
      )
    }
    app.save(orders)

    // 3. Create wishlist collection
    const projectsCollection = app.findCollectionByNameOrId('projects')
    const wishlist = new Collection({
      name: 'wishlist',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'project',
          type: 'relation',
          required: true,
          collectionId: projectsCollection.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_wishlist_user_project ON wishlist (user, project)'],
    })
    app.save(wishlist)

    // 4. Seed sample Fashionista user (idempotent)
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'fashionista@vmodabrasil.com')
    } catch (_) {
      const rec = new Record(users)
      rec.setEmail('fashionista@vmodabrasil.com')
      rec.setPassword('Skip@Pass')
      rec.setVerified(true)
      rec.set('name', 'Fashionista Demo')
      rec.set('role', 'fashionista')
      rec.set('segment_tier', 'retail')
      rec.set('city', 'São Paulo')
      app.save(rec)
    }
  },
  (app) => {
    try {
      const w = app.findCollectionByNameOrId('wishlist')
      app.delete(w)
    } catch (_) {}
    try {
      const o = app.findCollectionByNameOrId('orders')
      o.fields.removeByName('order_type')
      app.save(o)
    } catch (_) {}
    try {
      const u = app.findCollectionByNameOrId('_pb_users_auth_')
      const rf = u.fields.getByName('role')
      if (rf) {
        rf.values = (rf.values || []).filter((v) => v !== 'fashionista')
        app.save(u)
      }
    } catch (_) {}
    try {
      const rec = app.findAuthRecordByEmail('_pb_users_auth_', 'fashionista@vmodabrasil.com')
      app.delete(rec)
    } catch (_) {}
  },
)
