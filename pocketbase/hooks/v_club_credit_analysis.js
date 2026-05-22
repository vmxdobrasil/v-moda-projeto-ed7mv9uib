routerAdd(
  'POST',
  '/backend/v1/v-club/credit-analysis',
  (e) => {
    const body = e.requestInfo().body || {}
    const customerId = body.customerId
    const storeId = body.storeId
    const requestedLimit = Number(body.requestedLimit) || 1000

    if (!customerId || !storeId) {
      return e.badRequestError('Missing customer or store')
    }

    try {
      return $app.runInTransaction((txApp) => {
        // Find or create card
        try {
          const existing = txApp.findFirstRecordByFilter(
            'v_club_cards',
            'customer = {:c} && store = {:s}',
            { c: customerId, s: storeId },
          )
          return e.json(200, { success: true, cardId: existing.id })
        } catch (_) {}

        // Calculate Luhn digit to ensure valid BIN 636943 card number
        const generateLuhnCard = (bin) => {
          let cardNo = bin
          for (let i = 0; i < 9; i++) {
            cardNo += Math.floor(Math.random() * 10).toString()
          }
          // Compute check digit
          let nSum = 0
          let isSecond = true // since we will append 1 digit at the end
          for (let i = cardNo.length - 1; i >= 0; i--) {
            let d = parseInt(cardNo[i], 10)
            if (isSecond) d = d * 2
            nSum += parseInt(d / 10, 10)
            nSum += d % 10
            isSecond = !isSecond
          }
          const checkDigit = (10 - (nSum % 10)) % 10
          return cardNo + checkDigit.toString()
        }

        const cardNumber = generateLuhnCard('636943')

        // Generate Expiration (3 years from now)
        const expDate = new Date()
        expDate.setFullYear(expDate.getFullYear() + 3)

        // Get max sequential ID
        let seqId = 1
        try {
          const cards = txApp.findRecordsByFilter(
            'v_club_cards',
            'store = {:s}',
            '-sequential_id',
            1,
            0,
            { s: storeId },
          )
          if (cards.length > 0) {
            seqId = cards[0].getInt('sequential_id') + 1
          }
        } catch (_) {}

        const col = txApp.findCollectionByNameOrId('v_club_cards')
        const record = new Record(col)
        record.set('customer', customerId)
        record.set('store', storeId)
        record.set('card_number', cardNumber)
        record.set('expiration_date', expDate.toISOString())
        record.set('status', 'active')
        record.set('physical_status', 'none')
        record.set('credit_limit', requestedLimit)
        record.set('available_limit', requestedLimit)
        record.set('sequential_id', seqId)

        txApp.save(record)

        // Update customer status
        const customer = txApp.findRecordById('customers', customerId)
        customer.set('v_club_status', 'approved')
        txApp.save(customer)

        return e.json(200, { success: true, cardId: record.id })
      })
    } catch (err) {
      return e.badRequestError(String(err))
    }
  },
  $apis.requireAuth(),
)
