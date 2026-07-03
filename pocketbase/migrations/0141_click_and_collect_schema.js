migrate(
  (app) => {
    const orders = app.findCollectionByNameOrId('orders')

    if (!orders.fields.getByName('pickup_qr_code')) {
      orders.fields.add(new TextField({ name: 'pickup_qr_code' }))
    }
    if (!orders.fields.getByName('is_pickup')) {
      orders.fields.add(new BoolField({ name: 'is_pickup' }))
    }
    if (!orders.fields.getByName('pickup_partner_id')) {
      const customersCol = app.findCollectionByNameOrId('customers')
      orders.fields.add(
        new RelationField({
          name: 'pickup_partner_id',
          collectionId: customersCol.id,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }
    if (!orders.fields.getByName('split_json')) {
      orders.fields.add(new JSONField({ name: 'split_json' }))
    }
    app.save(orders)

    const customers = app.findCollectionByNameOrId('customers')
    customers.addIndex('idx_customers_exclusivity_zone', false, 'exclusivity_zone', '')
    customers.addIndex('idx_customers_is_exclusive', false, 'is_exclusive', '')
    app.save(customers)
  },
  (app) => {
    try {
      const orders = app.findCollectionByNameOrId('orders')
      try {
        orders.fields.removeByName('pickup_qr_code')
      } catch (_) {}
      try {
        orders.fields.removeByName('is_pickup')
      } catch (_) {}
      try {
        orders.fields.removeByName('pickup_partner_id')
      } catch (_) {}
      try {
        orders.fields.removeByName('split_json')
      } catch (_) {}
      app.save(orders)
    } catch (_) {}

    try {
      const customers = app.findCollectionByNameOrId('customers')
      try {
        customers.removeIndex('idx_customers_exclusivity_zone')
      } catch (_) {}
      try {
        customers.removeIndex('idx_customers_is_exclusive')
      } catch (_) {}
      app.save(customers)
    } catch (_) {}
  },
)
