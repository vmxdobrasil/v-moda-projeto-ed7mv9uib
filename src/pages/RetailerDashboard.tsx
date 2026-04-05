import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Activity, Heart, ArrowRight, Star } from 'lucide-react'
import { useFavorites } from '@/contexts/FavoritesContext'
import useAuthStore from '@/stores/useAuthStore'
import { BrandCard } from '@/components/BrandCard'
import { Card, CardContent } from '@/components/ui/card'
import pb from '@/lib/pocketbase/client'
import { FadeIn } from '@/components/FadeIn'

export default function RetailerDashboard() {
  const { user, isAuthenticated } = useAuthStore()
  const { favorites } = useFavorites()
  const navigate = useNavigate()
  const [favoriteBrands, setFavoriteBrands] = useState<any[]>([])
  const [recommendedBrands, setRecommendedBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const loadData = async () => {
      const brandIds = Object.keys(favorites)
      if (brandIds.length === 0) {
        setFavoriteBrands([])
        setRecommendedBrands([])
        setLoading(false)
        return
      }

      try {
        // Load favorite brands
        const filterStr = brandIds.map((id) => `id="${id}"`).join(' || ')
        const brands = await pb.collection('customers').getFullList({
          filter: filterStr,
        })
        setFavoriteBrands(brands)

        // Load recommended brands based on favorite categories and high rating
        const categories = [...new Set(brands.map((b) => b.ranking_category).filter(Boolean))]
        if (categories.length > 0) {
          const catFilter = categories.map((c) => `ranking_category="${c}"`).join(' || ')
          const favIds = brandIds.map((id) => `id!="${id}"`).join(' && ')

          let recFilter = `(${catFilter}) && rating_average >= 4.0 && status='converted'`
          if (favIds) recFilter += ` && (${favIds})`

          const recs = await pb.collection('customers').getList(1, 4, {
            filter: recFilter,
            sort: '-rating_average,-rating_count',
          })
          setRecommendedBrands(recs.items)
        } else {
          setRecommendedBrands([])
        }
      } catch (err) {
        console.error('Error loading dashboard data', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [favorites, isAuthenticated, navigate])

  if (!isAuthenticated || !user) return null

  const favoritesCount = Object.keys(favorites).length
  const engagementLevel = favoritesCount > 10 ? 'Alto' : favoritesCount > 0 ? 'Médio' : 'Iniciante'

  return (
    <main className="w-full pt-24 pb-24 bg-muted/10 min-h-screen">
      <div className="container">
        <FadeIn>
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-serif mb-4">Meu Painel</h1>
            <p className="text-muted-foreground">
              Bem-vindo(a) de volta. Gerencie suas marcas favoritas e acompanhe seu engajamento.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <FadeIn delay={100}>
            <Card className="bg-background h-full">
              <CardContent className="p-6 flex items-center gap-4 h-full">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                  {user.avatar ? (
                    <img
                      src={pb.files.getUrl(user, user.avatar, { thumb: '100x100' })}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-serif text-lg truncate">{user.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <Link
                    to="/perfil"
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
                    Editar Perfil
                  </Link>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={200}>
            <Card className="bg-background h-full">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">Marcas Favoritas</span>
                </div>
                <div className="text-4xl font-serif">{favoritesCount}</div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={300}>
            <Card className="bg-background h-full">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-medium">Nível de Engajamento</span>
                </div>
                <div className="text-lg font-medium text-primary">{engagementLevel}</div>
                <p className="text-xs text-muted-foreground mt-1">Baseado nas suas interações</p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        <FadeIn delay={400}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-serif">Minhas Marcas Salvas</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[300px] bg-muted/50 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : favoriteBrands.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoriteBrands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          ) : (
            <Card className="bg-background/50 border-dashed">
              <CardContent className="p-12 text-center flex flex-col items-center">
                <Heart className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma marca salva</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Você ainda não adicionou nenhuma marca aos seus favoritos. Explore nosso guia de
                  moda e salve as marcas que mais gostar.
                </p>
                <Link
                  to="/guia-de-moda"
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  Explorar Marcas <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </CardContent>
            </Card>
          )}
        </FadeIn>

        {/* Recommended Brands Section */}
        {!loading && favoriteBrands.length > 0 && (
          <FadeIn delay={500}>
            <div className="mb-6 flex items-center justify-between mt-20">
              <h2 className="text-2xl font-serif flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> Recomendados para Você
              </h2>
            </div>

            {recommendedBrands.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendedBrands.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} />
                ))}
              </div>
            ) : (
              <Card className="bg-background/50 border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                  Não encontramos recomendações no momento. Continue explorando e favoritando mais
                  marcas!
                </CardContent>
              </Card>
            )}
          </FadeIn>
        )}
      </div>
    </main>
  )
}
