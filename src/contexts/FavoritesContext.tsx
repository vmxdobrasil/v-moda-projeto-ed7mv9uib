import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

interface FavoritesContextType {
  favorites: Record<string, string>
  toggleFavorite: (brandId: string) => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider')
  return context
}

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Record<string, string>>({})

  const loadFavorites = async () => {
    if (!pb.authStore.isValid) {
      setFavorites({})
      return
    }
    try {
      const res = await pb.collection('favorites').getFullList({
        filter: `user="${pb.authStore.record?.id}"`,
      })
      const map: Record<string, string> = {}
      res.forEach((f) => {
        map[f.brand] = f.id
      })
      setFavorites(map)
    } catch (e) {
      console.error('Error loading favorites', e)
    }
  }

  useEffect(() => {
    loadFavorites()
    const unsub = pb.authStore.onChange(() => {
      loadFavorites()
    })
    return () => {
      unsub()
    }
  }, [])

  useRealtime('favorites', (e) => {
    if (e.action === 'create' && e.record.user === pb.authStore.record?.id) {
      setFavorites((prev) => ({ ...prev, [e.record.brand]: e.record.id }))
    } else if (e.action === 'delete' && e.record.user === pb.authStore.record?.id) {
      setFavorites((prev) => {
        const next = { ...prev }
        delete next[e.record.brand]
        return next
      })
    }
  })

  const toggleFavorite = async (brandId: string) => {
    if (!pb.authStore.isValid) throw new Error('unauthorized')
    const favId = favorites[brandId]
    if (favId) {
      await pb.collection('favorites').delete(favId)
    } else {
      await pb.collection('favorites').create({ user: pb.authStore.record!.id, brand: brandId })
    }
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}
