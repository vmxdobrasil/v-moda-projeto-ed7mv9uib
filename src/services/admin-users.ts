import pb from '@/lib/pocketbase/client'
import { logActivity } from '@/services/activity-logs'

export async function getUsers(page = 1, perPage = 20, search = '') {
  const filter = search ? `(name ~ "${search}" || email ~ "${search}")` : ''
  return pb.collection('users').getList(page, perPage, {
    sort: '-created',
    filter,
  })
}

export async function updateUserRole(userId: string, role: string, userName: string) {
  await pb.collection('users').update(userId, { role })
  await logActivity('user_role_updated', `Role do usuário ${userName} alterado para ${role}`, {
    userId,
    role,
  })
}

export async function deleteUser(userId: string, userName: string) {
  await pb.collection('users').delete(userId)
  await logActivity('user_deleted', `Usuário ${userName} removido da plataforma`, { userId })
}
