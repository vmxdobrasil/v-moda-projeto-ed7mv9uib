routerAdd(
  'POST',
  '/backend/v1/v-club/transaction/{id}/refund',
  (e) => {
    const id = e.request.pathValue('id')

    try {
      // Check Environment settings
      let asaasEnv = 'sandbox'
      let asaasKey = ''
      try {
        const envRecord = $app.findFirstRecordByData('brand_settings', 'key', 'asaas_env')
        if (envRecord) asaasEnv = envRecord.getString('value_text') || 'sandbox'

        const keyRecord = $app.findFirstRecordByData(
          'brand_settings',
          'key',
          asaasEnv === 'sandbox' ? 'asaas_api_key_sandbox' : 'asaas_api_key_prod',
        )
        if (keyRecord) asaasKey = keyRecord.getString('value_text')
      } catch (_) {
        // ignore missing settings
      }

      const apiUrl =
        asaasEnv === 'sandbox' ? 'https://sandbox.asaas.com/api/v3' : 'https://api.asaas.com/v3'

      return $app.runInTransaction((txApp) => {
        const tx = txApp.findRecordById('v_club_transactions', id)

        if (tx.getString('status') !== 'approved') {
          throw new Error('Somente transações aprovadas podem ser estornadas.')
        }

        const storeId = tx.getString('store')
        if (!e.hasSuperuserAuth() && e.auth?.id !== storeId) {
          throw new Error('Acesso negado.')
        }

        // Here we would perform the actual Asaas API Request using `apiUrl` and `asaasKey`
        // Example logic for actual API interaction:
        // const res = $http.send({
        //   url: apiUrl + '/payments/' + tx.getString('asaas_payment_id') + '/refund',
        //   method: 'POST',
        //   headers: { 'access_token': asaasKey }
        // })
        // if (res.statusCode !== 200) throw new Error('Asaas API Error')

        // Mock Asaas refund success for now:

        const cardId = tx.getString('card')
        const card = txApp.findRecordById('v_club_cards', cardId)
        card.set('available_limit', card.getFloat('available_limit') + tx.getFloat('amount'))
        txApp.save(card)

        const split = tx.get('split_details') || {}
        const cashbackFee = split.cashback_fee || 0
        const customerId = card.getString('customer')

        if (cashbackFee > 0) {
          try {
            const cbRecord = txApp.findFirstRecordByFilter(
              'v_club_cashback',
              'customer = {:c} && store = {:s}',
              { c: customerId, s: storeId },
            )
            const newBalance = Math.max(0, cbRecord.getFloat('balance') - cashbackFee)
            cbRecord.set('balance', newBalance)
            txApp.save(cbRecord)
          } catch (_) {}
        }

        tx.set('status', 'refunded')
        txApp.save(tx)

        const notifications = txApp.findCollectionByNameOrId('notifications')
        const n = new Record(notifications)
        n.set('user', storeId)
        n.set('title', 'Estorno Solicitado e Aprovado')
        n.set(
          'message',
          `O estorno de R$ ${tx.getFloat('amount').toFixed(2)} foi processado (Env: ${asaasEnv}).`,
        )
        n.set('read', false)
        txApp.save(n)

        return e.json(200, { success: true })
      })
    } catch (err) {
      return e.badRequestError(String(err))
    }
  },
  $apis.requireAuth(),
)
