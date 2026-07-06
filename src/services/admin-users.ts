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

export async function updateUserWaitlist(userId: string, isWaitlisted: boolean, userName: string) {
  await pb.collection('users').update(userId, { is_waitlisted: isWaitlisted })
  await logActivity(
    'user_waitlist_toggled',
    `Status de lista de espera de ${userName} alterado para ${isWaitlisted ? 'aguardando' : 'liberado'}`,
    { userId, is_waitlisted: isWaitlisted },
  )
}

export async function updateUserApprovalStatus(userId: string, status: string, userName: string) {
  await pb.collection('users').update(userId, { approval_status: status })
  await logActivity(
    'user_approval_updated',
    `Status de aprovação de ${userName} alterado para ${status}`,
    { userId, approval_status: status },
  )
}

export async function deleteUser(userId: string, userName: string) {
  await pb.collection('users').delete(userId)
  await logActivity('user_deleted', `Usuário ${userName} removido da plataforma`, { userId })
}
