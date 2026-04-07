import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Activity, Heart, ArrowRight, Star, Video, Calendar } from 'lucide-react'
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
  const [videoHistory, setVideoHistory] = useState<any[]>([])
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

        if (user) {
          const sessions = await pb.collection('video_sessions').getList(1, 5, {
            filter: `host="${user.id}" || participant="${user.id}"`,
            sort: '-created',
            expand: 'host,participant',
          })
          setVideoHistory(sessions.items)
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

        {!loading && (
          <FadeIn delay={450}>
            <div className="mb-6 flex items-center justify-between mt-20">
              <h2 className="text-2xl font-serif flex items-center gap-2">
                <Video className="w-6 h-6 text-primary" /> Histórico de Negociações
              </h2>
            </div>
            {videoHistory.length > 0 ? (
              <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
                <div className="divide-y">
                  {videoHistory.map((session) => {
                    const isHost = session.host === user?.id
                    const partner = isHost ? session.expand?.participant : session.expand?.host
                    return (
                      <div
                        key={session.id}
                        className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {partner?.avatar ? (
                              <img
                                src={pb.files.getUrl(partner, partner.avatar, { thumb: '100x100' })}
                                className="w-full h-full rounded-full object-cover"
                                alt=""
                              />
                            ) : (
                              <User className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{session.room_name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />{' '}
                              {new Date(session.created).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(session.created).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              <span className="mx-1">•</span>
                              Com {partner?.name || 'Usuário'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              session.status === 'active'
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : session.status === 'ended'
                                  ? 'bg-neutral-100 text-neutral-800 border-neutral-200'
                                  : session.status === 'declined'
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}
                          >
                            {session.status === 'active'
                              ? 'Ativa'
                              : session.status === 'ended'
                                ? 'Finalizada'
                                : session.status === 'declined'
                                  ? 'Recusada'
                                  : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <Card className="bg-background/50 border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
                  <Video className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  Nenhuma negociação em vídeo realizada ainda.
                </CardContent>
              </Card>
            )}
          </FadeIn>
        )}

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
