routerAdd('POST', '/backend/v1/asaas/webhook', (e) => {
  const body = e.requestInfo().body || {}
  const event = body.event
  const paymentId = body.payment?.id
  const externalReference = body.payment?.externalReference // Expected to be the v_club_transaction ID

  if (!externalReference) {
    return e.json(200, { received: true, ignored: true })
  }

  try {
    return $app.runInTransaction((txApp) => {
      const tx = txApp.findRecordById('v_club_transactions', externalReference)

      if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
        if (tx.getString('status') !== 'approved') {
          tx.set('status', 'approved')
          txApp.save(tx)

          // Decrement limit if it was pending and just got approved
          const card = txApp.findRecordById('v_club_cards', tx.getString('card'))
          card.set('available_limit', card.getFloat('available_limit') - tx.getFloat('amount'))
          txApp.save(card)
        }
      } else if (event === 'PAYMENT_REFUNDED') {
        if (tx.getString('status') === 'approved') {
          tx.set('status', 'refunded')
          txApp.save(tx)

          // Restore limit securely
          const card = txApp.findRecordById('v_club_cards', tx.getString('card'))
          card.set('available_limit', card.getFloat('available_limit') + tx.getFloat('amount'))
          txApp.save(card)

          // Optional: Revert cashback
        }
      }

      return e.json(200, { success: true })
    })
  } catch (err) {
    return e.badRequestError(String(err))
  }
})
