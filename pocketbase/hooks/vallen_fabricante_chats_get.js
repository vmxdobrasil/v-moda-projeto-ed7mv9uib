routerAdd(
  'GET',
  '/backend/v1/vallen-fabricante/chats',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')
    const limit = parseInt(e.requestInfo().query?.limit || '20', 10) || 20
    return e.json(200, $ai.agent('vallen-fabricante').listConversations({ user_id: userId, limit }))
  },
  $apis.requireAuth(),
)
