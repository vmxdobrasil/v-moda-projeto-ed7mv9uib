import pb from '@/lib/pocketbase/client'

export interface Notification {
  id: string
  user: string
  customer_email: string
  title: string
  message: string
  read: boolean
  created: string
  updated: string
}

export const getMyNotifications = async () => {
  const email = pb.authStore.record?.email
  const userId = pb.authStore.record?.id

  if (!email && !userId) return []

  return pb.collection('notifications').getFullList<Notification>({
    filter: `customer_email = "${email}" || user = "${userId}"`,
    sort: '-created',
  })
}

export const markNotificationRead = async (id: string) => {
  return pb.collection('notifications').update(id, { read: true })
}
