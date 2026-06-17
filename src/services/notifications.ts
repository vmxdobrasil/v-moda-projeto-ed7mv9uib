import pb from '@/lib/pocketbase/client'

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  created: string
  user: string
  customer_email: string
}

export async function getMyNotifications(limit: number = 20): Promise<Notification[]> {
  try {
    const authRecord = pb.authStore.record
    if (!authRecord) return []

    // Filter matching exactly what the collection's listRule specifies
    const filter = `user = "${authRecord.id}" || customer_email = "${authRecord.email}"`

    const records = await pb.collection('notifications').getList(1, limit, {
      filter,
      sort: '-created',
    })
    return records.items as unknown as Notification[]
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return []
  }
}

export async function markNotificationRead(id: string) {
  try {
    return await pb.collection('notifications').update(id, { read: true })
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    throw error
  }
}
