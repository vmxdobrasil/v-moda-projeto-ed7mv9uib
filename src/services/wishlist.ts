import pb from '@/lib/pocketbase/client'

export interface WishlistItem {
  id: string
  user: string
  project: string
  created: string
  updated: string
  expand?: {
    project?: any
  }
}

export const getWishlist = () =>
  pb.collection('wishlist').getFullList<WishlistItem>({
    filter: `user="${pb.authStore.record?.id}"`,
    expand: 'project',
    sort: '-created',
  })

export const addToWishlist = (projectId: string) =>
  pb.collection('wishlist').create<WishlistItem>({
    user: pb.authStore.record?.id,
    project: projectId,
  })

export const removeFromWishlist = (id: string) => pb.collection('wishlist').delete(id)

export const toggleWishlist = async (projectId: string): Promise<boolean> => {
  try {
    const existing = await pb.collection('wishlist').getList(1, 1, {
      filter: `user="${pb.authStore.record?.id}" && project="${projectId}"`,
    })
    if (existing.items.length > 0) {
      await pb.collection('wishlist').delete(existing.items[0].id)
      return false
    }
    await pb.collection('wishlist').create({
      user: pb.authStore.record?.id,
      project: projectId,
    })
    return true
  } catch {
    return false
  }
}

export const isWishlisted = async (projectId: string): Promise<boolean> => {
  try {
    const res = await pb.collection('wishlist').getList(1, 1, {
      filter: `user="${pb.authStore.record?.id}" && project="${projectId}"`,
    })
    return res.items.length > 0
  } catch {
    return false
  }
}
