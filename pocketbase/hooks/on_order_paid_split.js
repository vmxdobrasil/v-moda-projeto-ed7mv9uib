onRecordAfterUpdateSuccess((e) => {
  const record = e.record
  const original = record.original()

  const oldStatus = original.getString('status')
  const newStatus = record.getString('status')

  if (oldStatus !== 'paid' && newStatus === 'paid') {
    try {
      const adminNotifCol = $app.findCollectionByNameOrId('notifications')
      const adminNotif = new Record(adminNotifCol)
      adminNotif.set('title', 'Novo pedido pago')
      adminNotif.set(
        'message',
        'O pedido ' +
          record.id +
          ' foi pago. Valor: R$ ' +
          record.getFloat('total_amount').toFixed(2),
      )
      adminNotif.set('read', false)
      $app.save(adminNotif)
    } catch (adminErr) {
      $app.logger().error('Failed to create admin notification', 'error', adminErr.message)
    }

    const customerId = record.getString('customer')
    if (!customerId) return e.next()

    try {
      const customer = $app.findRecordById('customers', customerId)
      const affiliateId = customer.getString('affiliate_referrer')
      if (!affiliateId) return e.next()

      const affiliate = $app.findRecordById('users', affiliateId)
      const commissionRate = affiliate.getFloat('commission_rate') || 0
      const totalAmount = record.getFloat('total_amount')
      const commission = totalAmount * (commissionRate / 100)

      if (commission <= 0) return e.next()

      const today = new Date().toISOString().split('T')[0]

      const finCol = $app.findCollectionByNameOrId('financial_transactions')
      const finRecord = new Record(finCol)
      finRecord.set('store', affiliateId)
      finRecord.set('type', 'receivable')
      finRecord.set('category', 'affiliate_commission')
      finRecord.set('amount', commission)
      finRecord.set('due_date', today)
      finRecord.set('status', 'pending')
      finRecord.set('description', 'Comissao de afiliado - Pedido ' + record.id)
      finRecord.set('customer', customerId)
      finRecord.set('order', record.id)
      $app.save(finRecord)

      const refCol = $app.findCollectionByNameOrId('referrals')
      const refRecord = new Record(refCol)
      refRecord.set('affiliate', affiliateId)
      refRecord.set('brand', customerId)
      refRecord.set('type', 'conversion')
      refRecord.set('metadata', {
        order_id: record.id,
        commission: commission,
        total_amount: totalAmount,
      })
      $app.saveNoValidate(refRecord)
    } catch (err) {
      $app.logger().error('Commission split failed', 'orderId', record.id, 'error', err.message)
    }
  }

  return e.next()
}, 'orders')
