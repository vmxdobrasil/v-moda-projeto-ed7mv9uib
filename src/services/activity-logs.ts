import pb from '@/lib/pocketbase/client'

export interface ActivityLog {
  id: string
  user: string
  action_type: string
  description: string
  metadata: any
  created: string
  expand?: { user: any }
}

export async function getActivityLogs(page = 1, perPage = 20, filter = '', search = '') {
  const filters: string[] = []
  if (filter) filters.push(filter)
  if (search) filters.push(`(action_type ~ "${search}" || description ~ "${search}")`)
  return pb.collection('activity_logs').getList(page, perPage, {
    sort: '-created',
    expand: 'user',
    filter: filters.join(' && '),
  })
}

export async function logActivity(actionType: string, description: string, metadata?: any) {
  try {
    const userId = pb.authStore.record?.id
    if (!userId) return
    await pb.collection('activity_logs').create({
      user: userId,
      action_type: actionType,
      description,
      metadata: metadata || {},
    })
  } catch (e) {
    console.error('Failed to log activity:', e)
  }
}
