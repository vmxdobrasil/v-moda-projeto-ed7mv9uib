import { useState, useEffect, useCallback } from 'react'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import useCartStore from '@/stores/useCartStore'
import { getWishlist, removeFromWishlist } from '@/services/wishlist'

export default function FashionistaWishlist() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()

  const loadWishlist = useCallback(async () => {
    try {
      const data = await getWishlist()
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  const getImageUrl = (product: any) => {
    if (product.gallery) {
      return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${product.collectionId}/${product.id}/${product.gallery}`
    }
    if (product.image) {
      return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${product.collectionId}/${product.id}/${product.image}`
    }
    return `https://img.usecurling.com/p/400/500?q=fashion`
  }

  const handleRemove = async (id: string) => {
    try {
      await removeFromWishlist(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast({ title: 'Removido dos favoritos' })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao remover' })
    }
  }

  const handleAddToCart = (product: any) => {
    addItem({ product, quantity: 1 })
    toast({ title: 'Adicionado à sacola!', description: product.name })
  }

  const displayPrice = (product: any) => product.retail_price || product.price || 0

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-7 h-7 text-primary fill-primary" />
        <h1 className="text-3xl font-display font-bold">Meus Favoritos</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-display font-semibold mb-2">Nenhum favorito ainda</h2>
          <p className="text-muted-foreground mb-6">
            Salve seus produtos preferidos para encontrá-los aqui.
          </p>
          <Button asChild className="bg-electric hover:bg-electric/90 text-white">
            <Link to="/fashionista/catalog">Explorar Catálogo</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((item) => {
            const product = item.expand?.project
            if (!product) return null
            return (
              <Card key={item.id} className="fashion-tech-card overflow-hidden group">
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={getImageUrl(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    loading="lazy"
                  />
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <CardContent className="p-3 md:p-4">
                  <h3 className="text-sm font-medium line-clamp-2 mb-1">{product.name}</h3>
                  <p className="text-lg font-bold text-primary mb-2">
                    R$ {displayPrice(product).toFixed(2)}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-electric hover:bg-electric/90 text-white gap-1"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    Adicionar à Sacola
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
