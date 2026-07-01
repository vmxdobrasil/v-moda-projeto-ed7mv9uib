import pb from '@/lib/pocketbase/client'

export interface Category {
  id: string
  name: string
  slug: string
  ranking_limit: number
  thumbnail?: string
  banner?: string
}

export const getCategories = async () =>
  pb.collection('categories').getFullList<Category>({ sort: 'name' })

export const updateCategory = async (id: string, data: Partial<Category>) =>
  pb.collection('categories').update(id, data)

export const createCategory = async (data: Partial<Category>) =>
  pb.collection('categories').create(data)

export const deleteCategory = async (id: string) => pb.collection('categories').delete(id)
