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

        const cardNumber = card.getString('card_number')

        // Luhn validation inline
        const checkLuhn = (cardNo) => {
          let nDigits = cardNo.length
          let nSum = 0
          let isSecond = false
          for (let i = nDigits - 1; i >= 0; i--) {
            let d = parseInt(cardNo[i], 10)
            if (isSecond == true) d = d * 2
            nSum += parseInt(d / 10, 10)
            nSum += d % 10
            isSecond = !isSecond
          }
          return nSum % 10 == 0
        }

        if (!cardNumber.startsWith('636943') || !checkLuhn(cardNumber)) {
          throw new Error('Invalid card number or BIN (Must be 636943 with valid Luhn digit)')
        }

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
        const platformRate = settings.getFloat('platform_commission_rate') || 0.025
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

        // Mocking Asaas split calculation
        // Asaas Split Hierarchy
        const asaasFee = amount * 0.0199 // 1.99% Simulating Asaas Transaction Fee

        const splitDetails = {
          asaas_fee: asaasFee,
          platform_fee: amount * (platformRate / 100),
          cashback_fee: amount * (cashbackRate / 100),
          influencer_fee: amount * (influencerRate / 100),
          guide_fee: amount * (guideRate / 100),
        }

        splitDetails.net_to_store =
          amount -
          splitDetails.asaas_fee -
          splitDetails.platform_fee -
          splitDetails.cashback_fee -
          splitDetails.influencer_fee -
          splitDetails.guide_fee

        const txCol = txApp.findCollectionByNameOrId('v_club_transactions')
        const newTx = new Record(txCol)
        newTx.set('card', cardId)
        newTx.set('store', storeId)
        newTx.set('amount', amount)
        // Set to pending initially, waiting for gateway webhook to authorize and capture.
        // For demonstration purposes, we will auto-approve it below to mimic immediate authorization.
        newTx.set('status', 'pending')
        newTx.set('split_details', splitDetails)
        txApp.save(newTx)

        // Mock Asaas Authorization Success (Immediate Capture)
        newTx.set('status', 'approved')
        txApp.save(newTx)

        // Decrement Limit after approval
        card.set('available_limit', availableLimit - amount)
        txApp.save(card)

        // Distribute Cashback
        if (cashbackRate > 0) {
          try {
            const cbRecord = txApp.findFirstRecordByFilter(
              'v_club_cashback',
              'customer = {:c} && store = {:s}',
              { c: customerId, s: storeId },
            )
            cbRecord.set('balance', cbRecord.getFloat('balance') + splitDetails.cashback_fee)
            txApp.save(cbRecord)
          } catch (_) {
            const cbCol = txApp.findCollectionByNameOrId('v_club_cashback')
            const newCb = new Record(cbCol)
            newCb.set('customer', customerId)
            newCb.set('store', storeId)
            newCb.set('balance', splitDetails.cashback_fee)
            txApp.save(newCb)
          }
        }

        return e.json(200, { success: true, transactionId: newTx.id, splitDetails })
      })
    } catch (err) {
      return e.badRequestError(String(err))
    }
  },
  $apis.requireAuth(),
)
