import pb from '@/lib/pocketbase/client'

export interface Resource {
  id: string
  name: string
  type: 'ebook' | 'magazine' | 'video' | 'course'
  url: string
  description?: string
  thumbnail?: string
  created: string
  updated: string
}

export const getResources = async () => {
  return pb.collection('resources').getFullList<Resource>({
    sort: '-created',
  })
}
