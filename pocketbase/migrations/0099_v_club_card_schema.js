migrate(
  (app) => {
    const vClubSettings = new Collection({
      name: 'v_club_settings',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com' || store = @request.auth.id",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        {
          name: 'store',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'is_active', type: 'bool', required: false },
        { name: 'platform_commission_rate', type: 'number', required: false },
        { name: 'store_cashback_rate', type: 'number', required: false },
        { name: 'store_identifier', type: 'text', required: true, min: 4, max: 4 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_v_club_settings_store ON v_club_settings (store)',
        'CREATE UNIQUE INDEX idx_v_club_settings_identifier ON v_club_settings (store_identifier)',
      ],
    })
    app.save(vClubSettings)

    const vClubCards = new Collection({
      name: 'v_club_cards',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != '' && store = @request.auth.id",
      updateRule: "@request.auth.id != ''",
      deleteRule: null,
      fields: [
        {
          name: 'customer',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('customers').id,
          maxSelect: 1,
        },
        {
          name: 'store',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'card_number', type: 'text', required: true },
        { name: 'expiration_date', type: 'date', required: true },
        { name: 'cvv_token', type: 'text', required: false },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['active', 'blocked', 'canceled'],
          maxSelect: 1,
        },
        {
          name: 'physical_status',
          type: 'select',
          required: false,
          values: ['none', 'requested', 'produced', 'in_transit', 'delivered', 'active'],
          maxSelect: 1,
        },
        { name: 'credit_limit', type: 'number', required: true },
        { name: 'available_limit', type: 'number', required: true },
        { name: 'sequential_id', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_v_club_cards_number ON v_club_cards (card_number)',
        'CREATE INDEX idx_v_club_cards_customer ON v_club_cards (customer)',
        'CREATE UNIQUE INDEX idx_v_club_cards_seq ON v_club_cards (store, sequential_id)',
      ],
    })
    app.save(vClubCards)

    const vClubCashback = new Collection({
      name: 'v_club_cashback',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'customer',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('customers').id,
          maxSelect: 1,
        },
        {
          name: 'store',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'balance', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_v_club_cashback_cust_store ON v_club_cashback (customer, store)',
      ],
    })
    app.save(vClubCashback)

    const vClubTransactions = new Collection({
      name: 'v_club_transactions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'card',
          type: 'relation',
          required: true,
          collectionId: vClubCards.id,
          maxSelect: 1,
        },
        {
          name: 'store',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'amount', type: 'number', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'approved', 'denied', 'refunded'],
          maxSelect: 1,
        },
        { name: 'split_details', type: 'json', required: false },
        { name: 'qr_code_token', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_v_club_transactions_card ON v_club_transactions (card)'],
    })
    app.save(vClubTransactions)

    const customers = app.findCollectionByNameOrId('customers')
    customers.fields.add(
      new SelectField({
        name: 'v_club_status',
        values: ['none', 'pending', 'approved', 'denied'],
        maxSelect: 1,
      }),
    )
    app.save(customers)
  },
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    customers.fields.removeByName('v_club_status')
    app.save(customers)

    app.delete(app.findCollectionByNameOrId('v_club_transactions'))
    app.delete(app.findCollectionByNameOrId('v_club_cashback'))
    app.delete(app.findCollectionByNameOrId('v_club_cards'))
    app.delete(app.findCollectionByNameOrId('v_club_settings'))
  },
)
