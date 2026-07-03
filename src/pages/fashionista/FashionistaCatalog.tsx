import { useState, useEffect, useCallback } from 'react'
import { Search, Heart, ShoppingBag, Filter } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import useCartStore from '@/stores/useCartStore'
import { toggleWishlist } from '@/services/wishlist'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { value: 'all', label: 'Todas' },
  { value: 'moda_feminina', label: 'Feminina' },
  { value: 'jeans', label: 'Jeans' },
  { value: 'moda_praia', label: 'Praia' },
  { value: 'moda_fitness', label: 'Fitness' },
  { value: 'moda_masculina', label: 'Masculina' },
  { value: 'plus_size', label: 'Plus Size' },
]

export default function FashionistaCatalog() {
  const [products, setProducts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set())
  const { addItem } = useCartStore()

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const conditions: string[] = []
      if (search) conditions.push(`name ~ "${search}"`)
      if (category !== 'all') conditions.push(`category = "${category}"`)
      const records = await pb.collection('projects').getList(1, 50, {
        filter: conditions.length > 0 ? conditions.join(' && ') : '',
        expand: 'manufacturer',
        sort: '-created',
      })
      setProducts(records.items)

      // Load wishlist IDs
      try {
        const wishlist = await pb.collection('wishlist').getFullList({
          filter: `user="${pb.authStore.record?.id}"`,
        })
        setWishlistedIds(new Set(wishlist.map((w: any) => w.project)))
      } catch {
        // wishlist collection might not exist yet
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [search, category])

  useEffect(() => {
    const timer = setTimeout(() => loadProducts(), 400)
    return () => clearTimeout(timer)
  }, [loadProducts])

  const getImageUrl = (product: any) => {
    if (product.gallery) {
      return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${product.collectionId}/${product.id}/${product.gallery}`
    }
    if (product.image) {
      return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${product.collectionId}/${product.id}/${product.image}`
    }
    return `https://img.usecurling.com/p/400/500?q=fashion%20clothing`
  }

  const handleAddToCart = (product: any) => {
    addItem({ product, quantity: 1 })
    toast({ title: 'Adicionado à sacola!', description: product.name })
  }

  const handleToggleWishlist = async (projectId: string) => {
    const isWishlisted = await toggleWishlist(projectId)
    setWishlistedIds((prev) => {
      const next = new Set(prev)
      if (isWishlisted) {
        next.add(projectId)
      } else {
        next.delete(projectId)
      }
      return next
    })
    toast({
      title: isWishlisted ? 'Adicionado aos favoritos!' : 'Removido dos favoritos',
    })
  }

  const displayPrice = (product: any) => {
    return product.retail_price || product.price || 0
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Catálogo Fashionista</h1>
          <p className="text-muted-foreground mt-1">Produtos selecionados a preço de varejo</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p>Nenhum produto encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const isWishlisted = wishlistedIds.has(product.id)
            return (
              <Card key={product.id} className="fashion-tech-card overflow-hidden group">
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={getImageUrl(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    loading="lazy"
                  />
                  <button
                    onClick={() => handleToggleWishlist(product.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white transition-colors"
                  >
                    <Heart
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground',
                      )}
                    />
                  </button>
                  {product.expand?.manufacturer && (
                    <Badge className="absolute top-2 left-2 bg-navy/80 backdrop-blur-sm text-white">
                      {product.expand.manufacturer.brand_name || product.expand.manufacturer.name}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3 md:p-4">
                  <h3 className="text-sm font-medium line-clamp-2 mb-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-lg font-bold text-primary">
                      R$ {displayPrice(product).toFixed(2)}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      className="bg-electric hover:bg-electric/90 text-white gap-1"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span className="hidden sm:inline">Sacola</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
