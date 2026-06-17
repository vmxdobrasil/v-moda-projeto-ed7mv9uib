import pb from '@/lib/pocketbase/client'

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  created: string
}

export const getMyNotifications = async (): Promise<Notification[]> => {
  if (!pb.authStore.isValid) return []

  try {
    const records = await pb.collection('notifications').getList(1, 20, {
      sort: '-created',
    })
    return records.items as unknown as Notification[]
  } catch (err) {
    console.error('Error fetching notifications:', err)
    return []
  }
}

export const markNotificationRead = async (id: string) => {
  return pb.collection('notifications').update(id, { read: true })
}
