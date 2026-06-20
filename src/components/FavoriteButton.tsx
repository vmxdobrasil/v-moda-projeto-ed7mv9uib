import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { addToQueue } from '@/lib/offline-sync'

export function FavoriteButton({ brandId, className }: { brandId: string; className?: string }) {
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteId, setFavoriteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    const checkFavorite = async () => {
      try {
        const records = await pb.collection('favorites').getList(1, 1, {
          filter: `user = "${user.id}" && brand = "${brandId}"`,
        })
        if (records.items.length > 0) {
          setIsFavorite(true)
          setFavoriteId(records.items[0].id)
        }
      } catch (e) {
        // ignore offline errors for read
      }
    }
    checkFavorite()
  }, [brandId, user])

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast({ description: 'Faça login para adicionar aos favoritos.' })
      return
    }

    setLoading(true)

    if (!navigator.onLine) {
      if (isFavorite && favoriteId) {
        await addToQueue({ collection: 'favorites', method: 'DELETE', recordId: favoriteId })
        setIsFavorite(false)
        setFavoriteId(null)
        toast({ description: 'Removido (offline). Será sincronizado.' })
      } else if (!isFavorite) {
        await addToQueue({
          collection: 'favorites',
          method: 'POST',
          data: { user: user.id, brand: brandId },
        })
        setIsFavorite(true)
        toast({ description: 'Salvo (offline). Será sincronizado.' })
      }
      setLoading(false)
      return
    }

    try {
      if (isFavorite && favoriteId) {
        await pb.collection('favorites').delete(favoriteId)
        setIsFavorite(false)
        setFavoriteId(null)
        toast({ description: 'Removido dos favoritos.' })
      } else {
        const record = await pb.collection('favorites').create({
          user: user.id,
          brand: brandId,
        })
        setIsFavorite(true)
        setFavoriteId(record.id)
        toast({ description: 'Adicionado aos favoritos!' })
      }
    } catch (error) {
      toast({ variant: 'destructive', description: 'Erro ao atualizar favoritos.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('rounded-full bg-white/50 backdrop-blur-sm hover:bg-white', className)}
      onClick={toggleFavorite}
      disabled={loading}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-colors',
          isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground',
        )}
      />
    </Button>
  )
}
