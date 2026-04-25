import pb from '@/lib/pocketbase/client'

export interface Referral {
  id: string
  affiliate: string
  brand: string
  type: 'click' | 'lead' | 'conversion'
  metadata: any
  created: string
  updated: string
  source_channel: 'whatsapp_group' | 'social_profile'
  expand?: {
    brand?: {
      name: string
      status: string
    }
  }
}

export const getReferrals = async () => {
  const user = pb.authStore.record
  if (!user) return []
  const isAdmin = user.email === 'valterpmendonca@gmail.com' || user.role === 'admin'
  const filter = isAdmin ? '' : `affiliate = "${user.id}" || brand.manufacturer = "${user.id}"`
  return pb.collection('referrals').getFullList<Referral>({
    filter,
    sort: '-created',
    expand: 'brand',
  })
}
