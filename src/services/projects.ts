import pb from '@/lib/pocketbase/client'

export interface Project {
  id: string
  name: string
  description: string
  image: string
  manufacturer: string
  category: string
  price?: number
  wholesale_price?: number
  retail_price?: number
  min_quantity_wholesale?: number
  stock_quantity?: number
  created: string
  updated: string
  expand?: {
    manufacturer?: {
      name: string
      avatar: string
    }
  }
}

export const getProjects = () =>
  pb.collection('projects').getFullList<Project>({
    expand: 'manufacturer',
    sort: '-created',
  })

export const createProject = async (data: FormData | Partial<Project>) => {
  const user = pb.authStore.record
  if (data instanceof FormData) {
    if (user && !data.has('manufacturer')) {
      data.append('manufacturer', user.id)
    }
  } else {
    if (user && !data.manufacturer) {
      data.manufacturer = user.id
    }
  }
  return pb.collection('projects').create<Project>(data)
}

export const updateProject = async (id: string, data: FormData | Partial<Project>) => {
  return pb.collection('projects').update<Project>(id, data)
}

export const deleteProject = async (id: string) => {
  return pb.collection('projects').delete(id)
}
