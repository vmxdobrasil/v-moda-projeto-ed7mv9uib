import pb from '@/lib/pocketbase/client'

export interface Resource {
  id: string
  name: string
  type: 'ebook' | 'magazine' | 'video' | 'course'
  url: string
  description?: string
  thumbnail?: string
  content_file?: string
  created: string
  updated: string
}

export const getResources = async () => {
  return pb.collection('resources').getFullList<Resource>({
    sort: '-created',
  })
}

export const createResource = async (data: FormData) => {
  return pb.collection('resources').create<Resource>(data)
}

export const updateResource = async (id: string, data: FormData) => {
  return pb.collection('resources').update<Resource>(id, data)
}

export const deleteResource = async (id: string) => {
  return pb.collection('resources').delete(id)
}
