routerAdd('POST', '/backend/v1/asaas/webhook', (e) => {
  const body = e.requestInfo().body || {}
  const event = body.event
  const externalReference = body.payment?.externalReference // Expected to be the v_club_transaction ID

  if (!externalReference) {
    return e.json(200, { received: true, ignored: true })
  }

  try {
    return $app.runInTransaction((txApp) => {
      let tx
      try {
        tx = txApp.findRecordById('v_club_transactions', externalReference)
      } catch (_) {
        return e.json(200, { received: true, ignored: true, reason: 'transaction_not_found' })
      }

      if (
        event === 'PAYMENT_RECEIVED' ||
        event === 'PAYMENT_CONFIRMED' ||
        event === 'PAYMENT_SETTLED'
      ) {
        if (tx.getString('status') !== 'approved') {
          tx.set('status', 'approved')

          // Decrement limit if it was pending and just got approved
          const card = txApp.findRecordById('v_club_cards', tx.getString('card'))
          card.set('available_limit', card.getFloat('available_limit') - tx.getFloat('amount'))
          txApp.save(card)
        }

        // Mark as settled in split_details if not already
        let splitDetails = tx.get('split_details') || {}
        if (!splitDetails.is_settled) {
          splitDetails.is_settled = true
          tx.set('split_details', splitDetails)
          txApp.save(tx)

          // Create Notification for the Manufacturer (no external SMS/WhatsApp)
          const notifications = txApp.findCollectionByNameOrId('notifications')
          const n = new Record(notifications)
          n.set('user', tx.getString('store'))
          n.set('title', 'Pagamento Liquidado (Asaas)')
          n.set(
            'message',
            `A transação de R$ ${tx.getFloat('amount').toFixed(2)} foi liquidada com sucesso.`,
          )
          n.set('read', false)
          txApp.save(n)
        }
      } else if (event === 'PAYMENT_REFUNDED') {
        if (tx.getString('status') === 'approved') {
          tx.set('status', 'refunded')
          txApp.save(tx)

          // Restore limit securely
          const card = txApp.findRecordById('v_club_cards', tx.getString('card'))
          card.set('available_limit', card.getFloat('available_limit') + tx.getFloat('amount'))
          txApp.save(card)

          // Reverse cashback
          const split = tx.get('split_details') || {}
          const cashbackFee = split.cashback_fee || 0
          const customerId = card.getString('customer')

          if (cashbackFee > 0) {
            try {
              const cbRecord = txApp.findFirstRecordByFilter(
                'v_club_cashback',
                'customer = {:c} && store = {:s}',
                { c: customerId, s: tx.getString('store') },
              )
              const newBalance = Math.max(0, cbRecord.getFloat('balance') - cashbackFee)
              cbRecord.set('balance', newBalance)
              txApp.save(cbRecord)
            } catch (_) {}
          }

          // Create Notification
          const notifications = txApp.findCollectionByNameOrId('notifications')
          const n = new Record(notifications)
          n.set('user', tx.getString('store'))
          n.set('title', 'Transação Estornada')
          n.set(
            'message',
            `O estorno de R$ ${tx.getFloat('amount').toFixed(2)} foi processado via Asaas.`,
          )
          n.set('read', false)
          txApp.save(n)
        }
      }

      return e.json(200, { success: true })
    })
  } catch (err) {
    return e.badRequestError(String(err))
  }
})
