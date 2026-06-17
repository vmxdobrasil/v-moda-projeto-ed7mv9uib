onRecordAfterCreateSuccess((e) => {
  const record = e.record
  const actionType = record.getString('action_type')
  const userId = record.getString('user')

  if (!userId) return e.next()

  try {
    if (actionType === 'calculator_use') {
      const metadata = record.get('metadata') || {}
      const productId = metadata.product_id

      if (productId) {
        const logs = $app.findRecordsByFilter(
          'user_behavior_logs',
          "user = {:userId} && (action_type = 'calculator_use' || action_type = 'checkout_start')",
          '-created',
          50,
          0,
          { userId },
        )

        let calcCount = 0
        let checkoutCount = 0

        for (const log of logs) {
          const m = log.get('metadata') || {}
          if (m.product_id === productId) {
            if (log.getString('action_type') === 'calculator_use') calcCount++
            if (log.getString('action_type') === 'checkout_start') checkoutCount++
          }
        }

        if (calcCount > 3 && checkoutCount === 0) {
          const existing = $app.findRecordsByFilter(
            'market_insights',
            "entity_type = 'product' && entity_id = {:productId} && insight_type = 'low_conversion' && is_resolved = false",
            '-created',
            1,
            0,
            { productId },
          )

          if (existing.length === 0) {
            const insightCol = $app.findCollectionByNameOrId('market_insights')
            const newInsight = new Record(insightCol)
            newInsight.set('entity_type', 'product')
            newInsight.set('entity_id', productId)
            newInsight.set('insight_type', 'low_conversion')
            newInsight.set('score', 85)
            newInsight.set(
              'suggested_action',
              'Singapore System: Offer volume discount or free freight to stimulate immediate conversion. ADA Strategy mapping: User is Negotiating but facing price/freight barrier.',
            )
            newInsight.set('is_resolved', false)

            $app.saveNoValidate(newInsight)

            try {
              const execCol = $app.findCollectionByNameOrId('action_executions')
              const exec = new Record(execCol)
              exec.set('insight', newInsight.id)
              exec.set('service_provider', 'email')
              exec.set('status', 'success')
              exec.set('payload', { message: 'Insight created for low conversion' })
              $app.saveNoValidate(exec)
            } catch (exErr) {
              $app.logger().error('Failed to log action execution', 'error', String(exErr))
            }
          }
        }
      }
    } else if (actionType === 'view_product') {
      const metadata = record.get('metadata') || {}
      const productId = metadata.product_id

      if (productId) {
        let region = 'general'
        try {
          const user = $app.findRecordById('users', userId)
          region = user.getString('fashion_hubs') || user.getString('operating_cities') || 'general'
        } catch (_) {}

        const views = $app.findRecordsByFilter(
          'user_behavior_logs',
          "action_type = 'view_product'",
          '-created',
          100,
          0,
          {},
        )

        let viewCount = 0
        for (const view of views) {
          const m = view.get('metadata') || {}
          if (m.product_id === productId) viewCount++
        }

        if (viewCount >= 5) {
          const existing = $app.findRecordsByFilter(
            'market_insights',
            "entity_type = 'product' && entity_id = {:productId} && insight_type = 'trending_up' && is_resolved = false",
            '-created',
            1,
            0,
            { productId },
          )

          if (existing.length === 0) {
            const insightCol = $app.findCollectionByNameOrId('market_insights')
            const newInsight = new Record(insightCol)
            newInsight.set('entity_type', 'product')
            newInsight.set('entity_id', productId)
            newInsight.set('insight_type', 'trending_up')
            newInsight.set('score', 92)
            newInsight.set(
              'suggested_action',
              `Singapore System: Trending up in region ${region}. Prepare stock, optimize supply chain and notify local retailers.`,
            )
            newInsight.set('is_resolved', false)

            $app.saveNoValidate(newInsight)

            try {
              const execCol = $app.findCollectionByNameOrId('action_executions')
              const exec = new Record(execCol)
              exec.set('insight', newInsight.id)
              exec.set('service_provider', 'email')
              exec.set('status', 'success')
              exec.set('payload', { message: 'Trending up insight created' })
              $app.saveNoValidate(exec)
            } catch (exErr) {
              $app.logger().error('Failed to log action execution', 'error', String(exErr))
            }
          }
        }
      }
    }
  } catch (err) {
    $app.logger().error('OODA Engine Error', 'error', String(err))
  }

  e.next()
}, 'user_behavior_logs')
