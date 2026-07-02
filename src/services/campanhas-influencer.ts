import pb from '@/lib/pocketbase/client'

export interface CampanhaInfluencer {
  id: string
  affiliate: string
  coupon_code: string
  discount_percent: number
  is_active: boolean
  created: string
  updated: string
}

export const getCampanhas = async () => {
  const user = pb.authStore.record
  if (!user) return []
  const isAdmin = user.email === 'valterpmendonca@gmail.com' || (user as any).role === 'admin'
  const filter = isAdmin ? '' : `affiliate = "${user.id}"`
  return pb.collection('campanhas_influencer').getFullList<CampanhaInfluencer>({
    filter,
    sort: '-created',
  })
}

export const createCampanha = async (data: {
  affiliate: string
  coupon_code: string
  discount_percent: number
}) => {
  return pb.collection('campanhas_influencer').create<CampanhaInfluencer>({
    ...data,
    is_active: true,
  })
}

export const updateCampanha = async (id: string, data: Partial<CampanhaInfluencer>) => {
  return pb.collection('campanhas_influencer').update<CampanhaInfluencer>(id, data)
}

export const deleteCampanha = async (id: string) => {
  return pb.collection('campanhas_influencer').delete(id)
}
