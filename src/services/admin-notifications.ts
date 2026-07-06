import pb from '@/lib/pocketbase/client'

export async function createAdminNotification(title: string, message: string, userId?: string) {
  return pb.send('/backend/v1/admin/notifications', {
    method: 'POST',
    body: JSON.stringify({ title, message, user: userId || '' }),
    headers: { 'Content-Type': 'application/json' },
  })
}
