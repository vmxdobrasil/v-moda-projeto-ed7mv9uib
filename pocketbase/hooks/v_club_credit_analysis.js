routerAdd(
  'POST',
  '/backend/v1/v-club/credit-analysis',
  (e) => {
    const body = e.requestInfo().body || {}
    const customerId = body.customerId
    const storeId = body.storeId
    const requestedLimit = Number(body.requestedLimit) || 1000

    if (!customerId || !storeId) {
      return e.badRequestError('Missing customerId or storeId')
    }

    try {
      const settings = $app.findFirstRecordByData('v_club_settings', 'store', storeId)
      if (!settings.getBool('is_active')) {
        return e.badRequestError('V Club is not active for this store')
      }

      let existingCard
      try {
        existingCard = $app.findFirstRecordByFilter(
          'v_club_cards',
          'customer = {:c} && store = {:s}',
          { c: customerId, s: storeId },
        )
      } catch (_) {}

      if (existingCard) {
        return e.badRequestError('Customer already has a card for this store')
      }

      let maxSeq = 0
      try {
        const records = $app.findRecordsByFilter(
          'v_club_cards',
          'store = {:s}',
          '-sequential_id',
          1,
          0,
          { s: storeId },
        )
        if (records && records.length > 0) {
          maxSeq = records[0].getInt('sequential_id')
        }
      } catch (_) {}
      const seqId = maxSeq + 1

      const bin = '636943'
      const storeIdentifier = settings.getString('store_identifier')
      const seqStr = String(seqId).padStart(5, '0')
      const base15 = bin + storeIdentifier + seqStr

      let sum = 0
      for (let i = 0; i < 15; i++) {
        let digit = parseInt(base15.charAt(14 - i), 10)
        if (i % 2 === 0) {
          digit *= 2
          if (digit > 9) digit -= 9
        }
        sum += digit
      }
      const checkDigit = (10 - (sum % 10)) % 10
      const cardNumber = base15 + checkDigit

      const expDate = new Date()
      expDate.setFullYear(expDate.getFullYear() + 5)
      const expStr = expDate.toISOString().replace('T', ' ')

      const cardsCol = $app.findCollectionByNameOrId('v_club_cards')
      const newCard = new Record(cardsCol)
      newCard.set('customer', customerId)
      newCard.set('store', storeId)
      newCard.set('card_number', cardNumber)
      newCard.set('expiration_date', expStr)
      newCard.set('cvv_token', $security.randomString(16))
      newCard.set('status', 'active')
      newCard.set('physical_status', 'none')
      newCard.set('credit_limit', requestedLimit)
      newCard.set('available_limit', requestedLimit)
      newCard.set('sequential_id', seqId)
      $app.save(newCard)

      const customer = $app.findRecordById('customers', customerId)
      customer.set('v_club_status', 'approved')
      $app.save(customer)

      try {
        $app.findFirstRecordByFilter('v_club_cashback', 'customer = {:c} && store = {:s}', {
          c: customerId,
          s: storeId,
        })
      } catch (_) {
        const cbCol = $app.findCollectionByNameOrId('v_club_cashback')
        const newCb = new Record(cbCol)
        newCb.set('customer', customerId)
        newCb.set('store', storeId)
        newCb.set('balance', 0)
        $app.save(newCb)
      }

      return e.json(200, { success: true, cardId: newCard.id })
    } catch (err) {
      $app.logger().error('Credit analysis error', 'err', String(err))
      return e.badRequestError(String(err))
    }
  },
  $apis.requireAuth(),
)
