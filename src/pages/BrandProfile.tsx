import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  MessageCircle,
  MapPin,
  Trophy,
  ArrowLeft,
  Image as ImageIcon,
  Star,
  MessageSquareQuote,
} from 'lucide-react'
import { useSEO } from '@/hooks/useSEO'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { FadeIn } from '@/components/FadeIn'
import { FavoriteButton } from '@/components/FavoriteButton'
import { ReviewDialog } from '@/components/ReviewDialog'
import useAuthStore from '@/stores/useAuthStore'

export default function BrandProfile() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [brand, setBrand] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useSEO({ title: brand ? `${brand.name} - Perfil da Marca` : 'Perfil da Marca' })

  const loadReviews = async () => {
    if (!id) return
    try {
      const r = await pb.collection('reviews').getFullList({
        filter: `brand="${id}"`,
        sort: '-created',
        expand: 'user',
      })
      setReviews(r)
    } catch (e) {
      console.error('Error loading reviews:', e)
    }
  }

  useEffect(() => {
    if (!id) return
    const loadData = async () => {
      try {
        const b = await pb.collection('customers').getOne(id, { expand: 'category_id' })
        setBrand(b)
        if (b.manufacturer) {
          const p = await pb.collection('projects').getFullList({
            filter: `manufacturer="${b.manufacturer}"`,
            sort: '-created',
            expand: 'category_id',
          })
          setProjects(p)
        }
        await loadReviews()
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  useRealtime('reviews', (e) => {
    if (e.record.brand === id) {
      loadReviews()
      // Reload brand to update average rating display
      pb.collection('customers').getOne(id).then(setBrand).catch(console.error)
    }
  })

  useRealtime('customers', (e) => {
    if (e.record.id === id) {
      setBrand(e.record)
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <p>Marca não encontrada.</p>
      </div>
    )
  }

  const isTop60 = (brand.ranking_position > 0 && brand.ranking_position <= 60) || brand.is_exclusive
  const existingReview = reviews.find((r) => r.user === user?.id)

  const handleWhatsAppClick = async () => {
    if (brand.id) {
      try {
        await pb.send(`/backend/v1/partners/${brand.id}/click`, { method: 'POST' })

        const ref = sessionStorage.getItem('vmoda_affiliate_ref')
        if (ref) {
          await pb
            .send('/backend/v1/referrals/track', {
              method: 'POST',
              body: JSON.stringify({
                code: ref,
                brandId: brand.id,
                type: 'lead',
                metadata: { source: 'whatsapp_click' },
              }),
            })
            .catch(console.error)
        }
      } catch (e) {
        console.error('Error tracking click', e)
      }
    }
    if (brand.phone) {
      window.open(`https://wa.me/${brand.phone.replace(/\D/g, '')}`, '_blank')
    }
  }

  return (
    <main className="w-full min-h-screen bg-muted/10 pb-24 pt-32">
      <div className="container max-w-5xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <FadeIn>
          <div className="bg-background rounded-2xl p-8 md:p-12 shadow-sm border relative overflow-hidden">
            {isTop60 && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-6 py-2 rounded-bl-2xl font-bold tracking-wider uppercase text-sm flex items-center gap-2 shadow-md z-10">
                <Trophy className="w-4 h-4" /> TOP 60
              </div>
            )}
            <div className="absolute top-4 left-4 z-10">
              <FavoriteButton brandId={brand.id} className="w-10 h-10 bg-muted border" />
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left mt-4 md:mt-0">
              <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl shrink-0">
                <AvatarImage
                  src={
                    brand.avatar
                      ? pb.files.getUrl(brand, brand.avatar)
                      : `https://img.usecurling.com/ppl/large?seed=${brand.id}&gender=female`
                  }
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-serif">
                  {brand.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl md:text-5xl font-serif flex items-center justify-center md:justify-start gap-2 mb-2">
                    {brand.name}
                    {brand.is_verified && (
                      <BadgeCheck className="w-6 h-6 text-green-500" title="Verificado" />
                    )}
                  </h1>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm mt-3">
                    <span className="text-muted-foreground uppercase tracking-wider font-semibold">
                      {brand.expand?.category_id?.name ||
                        (brand.ranking_category
                          ? brand.ranking_category.replace(/_/g, ' ')
                          : 'Varejo / Revenda')}
                    </span>
                    {brand.price_level && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30 hidden sm:block"></span>
                        <span className="text-green-600 font-bold tracking-wider">
                          {brand.price_level}
                        </span>
                      </>
                    )}
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30 hidden sm:block"></span>
                    {brand.rating_count > 0 ? (
                      <div className="flex items-center gap-1.5 font-medium">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span>{brand.rating_average?.toFixed(1)}</span>
                        <a
                          href="#avaliacoes"
                          className="text-muted-foreground font-normal hover:underline hover:text-foreground transition-colors"
                        >
                          ({brand.rating_count}{' '}
                          {brand.rating_count === 1 ? 'avaliação' : 'avaliações'})
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="w-4 h-4" /> Novo
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {brand.city && brand.state
                    ? `${brand.city}, ${brand.state}`
                    : brand.exclusivity_zone || 'Localização não informada'}
                </div>

                <p className="text-foreground/80 leading-relaxed max-w-2xl">
                  {brand.bio ||
                    'Esta marca ainda não adicionou uma biografia ao seu perfil. Entre em contato diretamente para saber mais sobre seus produtos e coleções exclusivas.'}
                </p>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  {brand.phone ? (
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white"
                      onClick={handleWhatsAppClick}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" /> Falar no WhatsApp
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      disabled
                      variant="outline"
                      className="w-full sm:w-auto bg-muted/50"
                    >
                      Contato Indisponível
                    </Button>
                  )}
                  {user && (
                    <ReviewDialog
                      brandId={brand.id}
                      userId={user.id}
                      existingReview={existingReview}
                    >
                      <Button size="lg" variant="outline" className="w-full sm:w-auto">
                        <Star className="w-5 h-5 mr-2" />
                        {existingReview ? 'Editar Avaliação' : 'Avaliar Marca'}
                      </Button>
                    </ReviewDialog>
                  )}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="mt-16">
          <h2 className="text-2xl md:text-3xl font-serif mb-8 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary" /> Lookbook & Coleções
          </h2>

          {projects.length === 0 ? (
            <div className="text-center py-16 bg-background rounded-xl border border-dashed">
              <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum projeto ou coleção adicionada por esta marca ainda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {projects.map((project, i) => (
                <FadeIn key={project.id} delay={i * 100}>
                  <div className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-muted shadow-sm">
                    <img
                      src={pb.files.getUrl(project, project.image)}
                      alt={project.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <h3 className="text-white font-serif text-xl mb-1">{project.name}</h3>
                      {project.description && (
                        <p className="text-white/80 text-sm line-clamp-2">{project.description}</p>
                      )}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>

        <div id="avaliacoes" className="mt-20 scroll-mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-serif flex items-center gap-2">
              <MessageSquareQuote className="w-6 h-6 text-primary" /> Avaliações da Comunidade
            </h2>
            {user && !existingReview && (
              <ReviewDialog brandId={brand.id} userId={user.id}>
                <Button variant="outline" size="sm">
                  Deixar Avaliação
                </Button>
              </ReviewDialog>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-background rounded-xl border border-dashed">
              <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Esta marca ainda não possui avaliações.</p>
              {user ? (
                <ReviewDialog brandId={brand.id} userId={user.id}>
                  <Button variant="default">Seja o primeiro a avaliar</Button>
                </ReviewDialog>
              ) : (
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Faça login para avaliar
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review, i) => (
                <FadeIn key={review.id} delay={i * 50}>
                  <div className="bg-background p-6 rounded-xl border shadow-sm h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border">
                          <AvatarImage
                            src={
                              review.expand?.user?.avatar
                                ? pb.files.getUrl(review.expand.user, review.expand.user.avatar)
                                : undefined
                            }
                          />
                          <AvatarFallback>
                            {review.expand?.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {review.expand?.user?.name || 'Usuário'}
                            </p>
                            {review.expand?.user?.is_verified && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px] h-5 px-1.5 py-0 border-green-200"
                              >
                                <BadgeCheck className="w-3 h-3 mr-1" />
                                Lojista Verificado
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.created).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>{' '}
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${review.rating >= star ? 'fill-amber-500 text-amber-500' : 'fill-muted text-muted'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment ? (
                      <p className="text-muted-foreground text-sm leading-relaxed italic">
                        "{review.comment}"
                      </p>
                    ) : (
                      <p className="text-muted-foreground/50 text-sm italic">
                        Avaliação sem comentário.
                      </p>
                    )}
                    {review.images && review.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                        {review.images.map((img: string, idx: number) => (
                          <Dialog key={idx}>
                            <DialogTrigger asChild>
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity">
                                <img
                                  src={pb.files.getUrl(review, img, { thumb: '100x100' })}
                                  className="w-full h-full object-cover"
                                  alt={`Foto ${idx + 1}`}
                                />
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl w-[95vw] p-0 bg-transparent border-none shadow-none flex justify-center [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:hover:bg-black/80">
                              <img
                                src={pb.files.getUrl(review, img)}
                                className="max-w-full h-auto max-h-[85vh] object-contain rounded-lg"
                                alt={`Foto ampliada ${idx + 1}`}
                              />
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
