migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const userBehaviorLogs = new Collection({
      name: 'user_behavior_logs',
      type: 'base',
      listRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      viewRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: false,
          collectionId: users.id,
          maxSelect: 1,
        },
        {
          name: 'action_type',
          type: 'select',
          required: true,
          values: [
            'view_product',
            'add_to_favorites',
            'search_term',
            'abandoned_cart',
            'calculator_use',
            'checkout_start',
          ],
          maxSelect: 1,
        },
        { name: 'metadata', type: 'json', required: false },
        { name: 'path', type: 'text', required: false },
        { name: 'device_info', type: 'json', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_user_behavior_logs_action ON user_behavior_logs (action_type)'],
    })
    app.save(userBehaviorLogs)

    const marketInsights = new Collection({
      name: 'market_insights',
      type: 'base',
      listRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      viewRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      createRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        {
          name: 'entity_type',
          type: 'select',
          required: true,
          values: ['brand', 'product', 'region'],
          maxSelect: 1,
        },
        { name: 'entity_id', type: 'text', required: true },
        {
          name: 'insight_type',
          type: 'select',
          required: true,
          values: ['low_conversion', 'stock_out_risk', 'trending_up', 'performance_alert'],
          maxSelect: 1,
        },
        { name: 'score', type: 'number', required: false },
        { name: 'suggested_action', type: 'text', required: false },
        { name: 'is_resolved', type: 'bool', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_market_insights_resolved ON market_insights (is_resolved)'],
    })
    app.save(marketInsights)

    const actionExecutions = new Collection({
      name: 'action_executions',
      type: 'base',
      listRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      viewRule: "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      createRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.email = 'valterpmendonca@gmail.com'",
      fields: [
        {
          name: 'insight',
          type: 'relation',
          required: false,
          collectionId: marketInsights.id,
          maxSelect: 1,
        },
        {
          name: 'admin_user',
          type: 'relation',
          required: false,
          collectionId: users.id,
          maxSelect: 1,
        },
        {
          name: 'service_provider',
          type: 'select',
          required: true,
          values: ['firebase_fcm', 'asaas_api', 'whatsapp_evolution', 'email'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'success', 'failed'],
          maxSelect: 1,
        },
        { name: 'payload', type: 'json', required: false },
        { name: 'response_log', type: 'json', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(actionExecutions)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('action_executions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('market_insights'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('user_behavior_logs'))
    } catch (_) {}
  },
)
