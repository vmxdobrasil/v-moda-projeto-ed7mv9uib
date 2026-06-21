migrate(
  (app) => {
    const orders = new Collection({
      name: 'orders',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || seller_id = @request.auth.id || customer = @request.auth.id)",
      viewRule: '',
      createRule: '',
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || seller_id = @request.auth.id)",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'seller_id',
          type: 'relation',
          required: false,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'customer',
          type: 'relation',
          required: false,
          collectionId: app.findCollectionByNameOrId('customers').id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'guest_name', type: 'text', required: false },
        { name: 'guest_phone', type: 'text', required: false },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'paid', 'delivered'],
          maxSelect: 1,
        },
        { name: 'total_amount', type: 'number', required: true },
        {
          name: 'payment_method',
          type: 'select',
          required: false,
          values: ['asaas', 'pix'],
          maxSelect: 1,
        },
        { name: 'commission_amount', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_orders_seller ON orders (seller_id)',
        'CREATE INDEX idx_orders_status ON orders (status)',
      ],
    })
    app.save(orders)

    const orderItems = new Collection({
      name: 'order_items',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: "@request.auth.id != '' && (@request.auth.role = 'admin')",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'order_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('orders').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'project_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('projects').id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'quantity', type: 'number', required: true },
        { name: 'price_at_purchase', type: 'number', required: true },
        { name: 'selected_size', type: 'text', required: false },
        { name: 'selected_color', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_order_items_order ON order_items (order_id)'],
    })
    app.save(orderItems)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('order_items'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('orders'))
    } catch (_) {}
  },
)
