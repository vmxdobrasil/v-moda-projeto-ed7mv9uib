import pb from '@/lib/pocketbase/client'

export interface Referral {
  id: string
  affiliate: string
  brand: string
  type: 'click' | 'lead' | 'conversion'
  metadata?: any
  created: string
  updated: string
  source_channel?: string
  expand?: any
}

export const getReferrals = async () => {
  return pb.collection('referrals').getFullList<Referral>({
    sort: '-created',
    expand: 'brand,affiliate',
  })
}
