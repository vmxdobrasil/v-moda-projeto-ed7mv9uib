import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'

interface FavoriteButtonProps {
  brandId: string
  className?: string
}

export function FavoriteButton({ brandId, className }: FavoriteButtonProps) {
  const { favorites, toggleFavorite } = useFavorites()
  const { toast } = useToast()
  const isFav = !!favorites[brandId]

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!pb.authStore.isValid) {
      toast({
        title: 'Acesso restrito',
        description: 'Faça login para salvar favoritos.',
        variant: 'destructive',
      })
      return
    }
    try {
      await toggleFavorite(brandId)
      toast({ title: isFav ? 'Removido dos favoritos' : 'Adicionado aos favoritos' })
    } catch (err) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'rounded-full bg-background/50 hover:bg-background/80 backdrop-blur w-8 h-8 shadow-sm transition-all',
        className,
      )}
      onClick={handleToggle}
    >
      <Heart
        className={cn(
          'w-4 h-4 transition-colors',
          isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground',
        )}
      />
    </Button>
  )
}
