onRecordAfterCreateSuccess((e) => {
  const orderId = e.record.id
  const revendedoraId = e.record.getString('revendedora')
  const totalAmount = e.record.getFloat('total_amount')
  const pointsEarned = e.record.getFloat('points_earned') || Math.floor(totalAmount)

  if (!revendedoraId || totalAmount <= 0) return e.next()

  try {
    const revendedora = $app.findRecordById('revendedoras', revendedoraId)
    const currentPoints = revendedora.getFloat('total_points') || 0
    const newBalance = currentPoints + pointsEarned

    revendedora.set('total_points', newBalance)
    revendedora.set('monthly_points', (revendedora.getFloat('monthly_points') || 0) + pointsEarned)
    revendedora.set('total_sales', (revendedora.getFloat('total_sales') || 0) + totalAmount)

    if (newBalance >= 5000) revendedora.set('tier', 'diamante')
    else if (newBalance >= 1500) revendedora.set('tier', 'ouro')
    else if (newBalance >= 500) revendedora.set('tier', 'prata')
    else revendedora.set('tier', 'bronze')

    $app.save(revendedora)

    const histCol = $app.findCollectionByNameOrId('historico_pontos_revenda')
    const histRecord = new Record(histCol)
    histRecord.set('revendedora', revendedoraId)
    histRecord.set('order', orderId)
    histRecord.set('points', pointsEarned)
    histRecord.set('type', 'earned')
    histRecord.set('description', 'Pontos ganhos por pedido #' + orderId.slice(0, 8))
    histRecord.set('balance_after', newBalance)
    $app.save(histRecord)
  } catch (err) {
    $app.logger().error('Failed to award reseller points', 'error', err.message, 'order', orderId)
  }

  return e.next()
}, 'pedidos_revenda')
