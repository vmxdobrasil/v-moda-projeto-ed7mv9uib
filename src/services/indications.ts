import pb from '@/lib/pocketbase/client'

export interface CustomerIndication {
  id: string
  name: string
  status: string
  created: string
  affiliate_referrer: string
}

export interface ReferralStat {
  id: string
  type: 'click' | 'lead' | 'conversion'
  created: string
}

export const getReferredCustomers = async () => {
  const userId = pb.authStore.record?.id
  if (!userId) return []
  return pb.collection('customers').getFullList<CustomerIndication>({
    filter: `affiliate_referrer = "${userId}"`,
    sort: '-created',
  })
}

export const getReferralStats = async () => {
  const userId = pb.authStore.record?.id
  if (!userId) return []
  return pb.collection('referrals').getFullList<ReferralStat>({
    filter: `affiliate = "${userId}"`,
  })
}

export const activateAffiliate = async () => {
  const userId = pb.authStore.record?.id
  if (!userId) throw new Error('User not logged in')
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  return pb.collection('users').update(userId, { affiliate_code: code })
}
