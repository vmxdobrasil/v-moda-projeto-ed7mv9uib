onRecordUpdateRequest((e) => {
  const newStatus = e.record.get('status')
  if (newStatus === 'converted') {
    try {
      const oldRecord = $app.findRecordById('customers', e.record.id)
      if (oldRecord.get('status') !== 'converted') {
        // Notify Manufacturer
        const manufacturerId = e.record.get('manufacturer')
        if (manufacturerId) {
          const notifMan = new Record($app.findCollectionByNameOrId('notifications'))
          notifMan.set('user', manufacturerId)
          notifMan.set('title', '🚀 Meta Alcançada: Venda Concluída!')
          notifMan.set(
            'message',
            `O lead ${e.record.get('name')} foi convertido com sucesso para o status de Venda Concluída.`,
          )
          $app.saveNoValidate(notifMan)
        }

        // Notify Affiliate / Agent
        const affiliateId = e.record.get('affiliate_referrer')
        if (affiliateId) {
          const notifAff = new Record($app.findCollectionByNameOrId('notifications'))
          notifAff.set('user', affiliateId)
          notifAff.set('title', 'Nova Conversão Realizada!')
          notifAff.set(
            'message',
            `O lead ${e.record.get('name')} acaba de ser convertido com sucesso!`,
          )
          $app.saveNoValidate(notifAff)

          // Create Conversion Referral & Calc Commission
          const affiliateUser = $app.findRecordById('users', affiliateId)
          const role = affiliateUser.getString('role')
          let commissionRate = 0
          if (role === 'affiliate') {
            commissionRate = 2.0
          } else if (role === 'agent') {
            commissionRate = affiliateUser.getFloat('commission_rate') || 1.0
          }

          const referralsCol = $app.findCollectionByNameOrId('referrals')
          const referral = new Record(referralsCol)
          referral.set('affiliate', affiliateId)
          referral.set('brand', e.record.id)
          referral.set('type', 'conversion')
          referral.set('metadata', { commission_rate: commissionRate })
          $app.saveNoValidate(referral)
        }
      }
    } catch (err) {
      // Ignore if record doesn't exist yet
    }
  }
  e.next()
}, 'customers')
