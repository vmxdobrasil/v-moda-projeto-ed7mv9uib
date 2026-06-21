routerAdd(
  'POST',
  '/backend/v1/ask-agent',
  (e) => {
    const body = e.requestInfo().body || {}
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')

    const { agent, message } = body
    if (!agent || !message) return e.badRequestError('agent and message are required')

    try {
      const result = $ai.agent(agent).chat({
        user_id: userId,
        message: message,
      })

      return e.json(200, {
        content: result.content,
      })
    } catch (err) {
      $app.logger().error('Error in ask-agent', 'error', err.message)
      return e.internalServerError('Failed to query AI agent.')
    }
  },
  $apis.requireAuth(),
)
