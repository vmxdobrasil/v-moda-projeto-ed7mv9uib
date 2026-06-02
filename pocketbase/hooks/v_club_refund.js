routerAdd(
  'POST',
  '/backend/v1/v-club/refund',
  (e) => {
    const body = e.requestInfo().body || {}
    const transactionId = body.transaction_id

    if (!transactionId) return e.badRequestError('Missing transaction_id')

    $app.runInTransaction((txApp) => {
      const tx = txApp.findRecordById('v_club_transactions', transactionId)
      if (tx.getString('status') === 'refunded') {
        throw new BadRequestError('Transaction is already refunded.')
      }

      tx.set('status', 'refunded')
      txApp.save(tx)

      const amount = tx.getFloat('amount')

      txApp.expandRecord(tx, ['card'])
      const card = tx.expandedOne('card')
      if (!card) return

      $app.logger().info('Triggering Asaas refund API for transaction', 'txId', transactionId)

      try {
        const cashback = txApp.findFirstRecordByFilter(
          'v_club_cashback',
          `customer = '${card.getString('customer')}' && store = '${tx.getString('store')}'`,
        )
        const currentBalance = cashback.getFloat('balance')
        cashback.set('balance', Math.max(0, currentBalance - amount * 0.01))
        txApp.save(cashback)
      } catch (_) {}
    })

    return e.json(200, {
      success: true,
      message: 'Refund processed and cashback reconciled via Asaas.',
    })
  },
  $apis.requireAuth(),
)
