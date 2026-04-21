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
