import pb from '@/lib/pocketbase/client'

export interface LinkRastreio {
  id: string
  user: string
  name: string
  original_url: string
  short_code: string
  clicks: number
  created: string
  updated: string
}

export const getLinks = async () => {
  const user = pb.authStore.record
  if (!user) return []
  return pb.collection('links_rastreio').getFullList<LinkRastreio>({
    filter: `user = "${user.id}"`,
    sort: '-created',
  })
}

export const createLink = async (data: {
  name: string
  original_url: string
  short_code: string
}) => {
  const user = pb.authStore.record
  if (!user) throw new Error('Not authenticated')
  return pb.collection('links_rastreio').create<LinkRastreio>({
    user: user.id,
    ...data,
    clicks: 0,
  })
}

export const deleteLink = async (id: string) => {
  return pb.collection('links_rastreio').delete(id)
}
