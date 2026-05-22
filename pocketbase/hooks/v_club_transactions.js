routerAdd(
  'POST',
  '/backend/v1/v-club/transaction',
  (e) => {
    const body = e.requestInfo().body || {}
    const cardId = body.cardId
    const amount = Number(body.amount)

    if (!cardId || amount <= 0) {
      return e.badRequestError('Invalid card or amount')
    }

    try {
      return $app.runInTransaction((txApp) => {
        const card = txApp.findRecordById('v_club_cards', cardId)
        if (card.getString('status') !== 'active') {
          throw new Error('Card is not active')
        }

        const availableLimit = card.getFloat('available_limit')
        if (availableLimit < amount) {
          throw new Error('Insufficient credit limit')
        }

        const storeId = card.getString('store')
        const customerId = card.getString('customer')

        const settings = txApp.findFirstRecordByData('v_club_settings', 'store', storeId)
        const platformRate = settings.getFloat('platform_commission_rate') || 0
        const cashbackRate = settings.getFloat('store_cashback_rate') || 0

        let influencerRate = 0
        let guideRate = 0
        try {
          const customer = txApp.findRecordById('customers', customerId)
          const referrerId = customer.getString('affiliate_referrer')
          if (referrerId) {
            const referrer = txApp.findRecordById('users', referrerId)
            const role = referrer.getString('role')
            if (role === 'affiliate') influencerRate = 1.0
            if (role === 'agent') guideRate = 2.0
          }
        } catch (_) {}

        card.set('available_limit', availableLimit - amount)
        txApp.save(card)

        const splitDetails = {
          platform_fee: amount * (platformRate / 100),
          cashback_fee: amount * (cashbackRate / 100),
          influencer_fee: amount * (influencerRate / 100),
          guide_fee: amount * (guideRate / 100),
        }
        splitDetails.net_to_store =
          amount -
          splitDetails.platform_fee -
          splitDetails.cashback_fee -
          splitDetails.influencer_fee -
          splitDetails.guide_fee

        const txCol = txApp.findCollectionByNameOrId('v_club_transactions')
        const newTx = new Record(txCol)
        newTx.set('card', cardId)
        newTx.set('store', storeId)
        newTx.set('amount', amount)
        newTx.set('status', 'approved')
        newTx.set('split_details', splitDetails)
        txApp.save(newTx)

        if (cashbackRate > 0) {
          const cashbackAmount = amount * (cashbackRate / 100)
          const cbRecord = txApp.findFirstRecordByFilter(
            'v_club_cashback',
            'customer = {:c} && store = {:s}',
            { c: customerId, s: storeId },
          )
          cbRecord.set('balance', cbRecord.getFloat('balance') + cashbackAmount)
          txApp.save(cbRecord)
        }

        return e.json(200, { success: true, transactionId: newTx.id, splitDetails })
      })
    } catch (err) {
      return e.badRequestError(String(err))
    }
  },
  $apis.requireAuth(),
)
