routerAdd(
  'POST',
  '/backend/v1/sales-copilot/suggest',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')
    const body = e.requestInfo().body || {}
    const customerId = body.customer_id
    if (!customerId) return e.badRequestError('customer_id is required')

    try {
      const customer = $app.findRecordById('customers', customerId)

      const isManufacturer = customer.getString('manufacturer') === userId
      const isAffiliate = customer.getString('affiliate_referrer') === userId
      const isAdmin =
        e.auth?.getString('role') === 'admin' ||
        e.auth?.getString('email') === 'valterpmendonca@gmail.com'

      if (!isManufacturer && !isAffiliate && !isAdmin) {
        return e.forbiddenError('Not allowed to access this customer')
      }

      const message = `Analise o cliente abaixo e sugira a próxima ação de vendas:
Nome: ${customer.getString('name')}
Status Atual: ${customer.getString('status')}
Última Atualização: ${customer.getString('last_action_date') || customer.getString('updated')}
Anotações do Vendedor: ${customer.getString('notes') || 'Nenhuma'}
Cidade/Estado: ${customer.getString('city') || '?'}/${customer.getString('state') || '?'}`

      const result = $ai.agent('vallen-sales-copilot').chat({
        user_id: userId,
        message: message,
      })

      return e.json(200, { suggestion: result.content })
    } catch (err) {
      if (err.message && err.message.includes('no rows')) {
        return e.notFoundError('Customer not found')
      }
      const status = err.status || 500
      return e.json(status, { error: err.message || 'Failed to get suggestion' })
    }
  },
  $apis.requireAuth(),
)
