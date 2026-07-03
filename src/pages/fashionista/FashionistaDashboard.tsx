import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ShoppingBag, Heart, TrendingUp, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

export default function FashionistaDashboard() {
  const { user } = useAuth()
  const [featuredBrands, setFeaturedBrands] = useState<any[]>([])
  const [newArrivals, setNewArrivals] = useState<any[]>([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [brands, products, wishlist] = await Promise.all([
          pb
            .collection('customers')
            .getList(1, 6, {
              filter: 'is_verified = true',
              sort: '-rating_average',
            })
            .catch(() => ({ items: [] })),
          pb
            .collection('projects')
            .getList(1, 8, {
              sort: '-created',
              expand: 'manufacturer',
            })
            .catch(() => ({ items: [] })),
          pb
            .collection('wishlist')
            .getList(1, 1, {
              filter: `user="${pb.authStore.record?.id}"`,
            })
            .catch(() => ({ totalItems: 0 })),
        ])
        setFeaturedBrands(brands.items || [])
        setNewArrivals(products.items || [])
        setWishlistCount(wishlist.totalItems || 0)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getImageUrl = (product: any) => {
    if (product.gallery) {
      return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${product.collectionId}/${product.id}/${product.gallery}`
    }
    if (product.image) {
      return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${product.collectionId}/${product.id}/${product.image}`
    }
    return `https://img.usecurling.com/p/400/500?q=fashion%20clothing`
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in-up">
      {/* Hero Section */}
      <section className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Experiência Fashionista</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">
          Olá, {user?.name?.split(' ')[0] || 'Fashionista'}!
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Descubra as melhores marcas do Brasil, curadoria exclusiva e produtos de alta moda.
        </p>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <Card className="fashion-tech-card">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <ShoppingBag className="w-8 h-8 text-primary" />
            <h3 className="font-semibold">Comprar Agora</h3>
            <p className="text-xs text-muted-foreground">Explore o catálogo</p>
            <Button asChild size="sm" className="bg-electric hover:bg-electric/90 text-white mt-2">
              <Link to="/fashionista/catalog">Ver Catálogo</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="fashion-tech-card">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            <h3 className="font-semibold">Meus Favoritos</h3>
            <p className="text-xs text-muted-foreground">{wishlistCount} produtos salvos</p>
            <Button asChild size="sm" variant="outline" className="mt-2">
              <Link to="/fashionista/wishlist">Ver Favoritos</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="fashion-tech-card col-span-2 md:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h3 className="font-semibold">Top 100 Marcas</h3>
            <p className="text-xs text-muted-foreground">Marcas verificadas</p>
            <Button asChild size="sm" variant="outline" className="mt-2">
              <Link to="/top-marcas">Explorar</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Featured Brands */}
      {!loading && featuredBrands.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-bold">Marcas em Destaque</h2>
            <Badge variant="secondary" className="gap-1">
              <Star className="w-3 h-3" /> TOP 100
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {featuredBrands.map((brand) => (
              <Link
                key={brand.id}
                to={`/guia-de-moda`}
                className="fashion-tech-card bg-card p-4 flex flex-col items-center gap-2 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-display font-bold text-primary text-lg">
                    {brand.name?.charAt(0)?.toUpperCase() || 'V'}
                  </span>
                </div>
                <span className="text-sm font-medium line-clamp-1">{brand.name}</span>
                {brand.rating_average && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="w-3 h-3 text-primary" />
                    {brand.rating_average.toFixed(1)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {!loading && newArrivals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-bold">Novidades</h2>
            <Button asChild variant="link" className="text-primary">
              <Link to="/fashionista/catalog">Ver tudo →</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {newArrivals.slice(0, 4).map((product) => (
              <Link
                key={product.id}
                to="/fashionista/catalog"
                className="fashion-tech-card bg-card overflow-hidden group"
              >
                <div className="aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={getImageUrl(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
                  <p className="text-primary font-bold mt-1">
                    R$ {(product.retail_price || product.price || 0).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
    </div>
  )
}
