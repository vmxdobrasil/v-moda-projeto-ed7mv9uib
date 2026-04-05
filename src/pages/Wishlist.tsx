import { useState, useEffect } from 'react'
import { Heart, Search, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSEO } from '@/hooks/useSEO'
import { useFavorites } from '@/contexts/FavoritesContext'
import pb from '@/lib/pocketbase/client'
import { BrandCard } from '@/components/BrandCard'
import { FadeIn } from '@/components/FadeIn'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/use-realtime'

export default function Wishlist() {
  useSEO({ title: 'Marcas Favoritas', description: 'Suas marcas salvas e favoritas.' })
  const { favorites } = useFavorites()
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadFavoriteBrands = async () => {
    if (!pb.authStore.isValid) {
      setBrands([])
      setLoading(false)
      return
    }
    try {
      const favs = await pb.collection('favorites').getFullList({
        filter: `user="${pb.authStore.record?.id}"`,
        expand: 'brand',
        sort: '-created',
      })
      setBrands(favs.map((f) => f.expand?.brand).filter(Boolean))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavoriteBrands()
  }, [favorites])

  useRealtime('customers', () => {
    loadFavoriteBrands()
  })

  if (!pb.authStore.isValid) {
    return (
      <main className="w-full min-h-screen bg-muted/10 pb-24 pt-32 flex flex-col items-center justify-center text-center px-4">
        <Heart className="w-16 h-16 text-muted-foreground/30 mb-6" />
        <h1 className="text-3xl font-serif mb-4">Acesse sua conta</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Faça login para visualizar e gerenciar suas marcas favoritas.
        </p>
        <Button asChild size="lg">
          <Link to="/login">Fazer Login</Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen bg-muted/10 pb-24 pt-32">
      <section className="container mb-12">
        <FadeIn>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary fill-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif">Marcas Favoritas</h1>
              <p className="text-muted-foreground">
                Você salvou {brands.length} {brands.length === 1 ? 'marca' : 'marcas'}.
              </p>
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : brands.length === 0 ? (
          <FadeIn>
            <div className="flex flex-col items-center justify-center py-24 text-center bg-background rounded-xl border border-dashed">
              <Search className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-2xl font-serif mb-2">Nenhuma marca favorita</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Você ainda não salvou nenhuma marca. Explore o Guia de Moda e favorite as que mais
                gostar!
              </p>
              <Button asChild>
                <Link to="/guia-de-moda">Explorar Marcas</Link>
              </Button>
            </div>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brands.map((brand, i) => (
              <FadeIn key={brand.id} delay={(i % 10) * 50}>
                <BrandCard brand={brand} />
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
