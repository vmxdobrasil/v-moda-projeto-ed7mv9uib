routerAdd(
  'POST',
  '/backend/v1/fashionista/track-onboarding',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')

    const body = e.requestInfo().body || {}
    const metadata = body.metadata || {}

    try {
      const user = $app.findRecordById('users', userId)
      if (user.getString('role') !== 'fashionista') {
        return e.forbiddenError('only fashionista users can track onboarding')
      }

      user.set('social_links', JSON.stringify(metadata))
      $app.save(user)

      return e.json(200, { success: true })
    } catch (err) {
      return e.json(500, { error: 'failed to track onboarding' })
    }
  },
  $apis.requireAuth(),
)
