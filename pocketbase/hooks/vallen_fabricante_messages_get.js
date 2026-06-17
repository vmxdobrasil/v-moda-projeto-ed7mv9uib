routerAdd(
  'GET',
  '/backend/v1/vallen-fabricante/chats/{conversationId}/messages',
  (e) => {
    try {
      const userId = e.auth?.id
      if (!userId) return e.unauthorizedError('auth required')
      return e.json(
        200,
        $ai.agent('vallen-fabricante').listMessages({
          conversation_id: e.request.pathValue('conversationId'),
          user_id: userId,
        }),
      )
    } catch (err) {
      if (err.name === 'SkipAiAgentsError') {
        const status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'conversation lookup failed' : err.message })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
