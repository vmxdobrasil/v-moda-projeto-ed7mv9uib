import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  MessageCircle,
  MapPin,
  Trophy,
  ArrowLeft,
  Image as ImageIcon,
} from 'lucide-react'
import { useSEO } from '@/hooks/useSEO'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FadeIn } from '@/components/FadeIn'
import { FavoriteButton } from '@/components/FavoriteButton'

export default function BrandProfile() {
  const { id } = useParams<{ id: string }>()
  const [brand, setBrand] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useSEO({ title: brand ? `${brand.name} - Perfil da Marca` : 'Perfil da Marca' })

  useEffect(() => {
    if (!id) return
    const loadData = async () => {
      try {
        const b = await pb.collection('customers').getOne(id)
        setBrand(b)
        if (b.manufacturer) {
          const p = await pb.collection('projects').getFullList({
            filter: `manufacturer="${b.manufacturer}"`,
            sort: '-created',
          })
          setProjects(p)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

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

  const handleWhatsAppClick = async () => {
    if (brand.id) {
      try {
        await pb.send(`/backend/v1/partners/${brand.id}/click`, { method: 'POST' })
      } catch (e) {}
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
                  <h1 className="text-3xl md:text-5xl font-serif flex items-center justify-center md:justify-start gap-2">
                    {brand.name}
                    {brand.is_verified && (
                      <BadgeCheck className="w-6 h-6 text-green-500" title="Verificado" />
                    )}
                  </h1>
                  <p className="text-muted-foreground uppercase tracking-wider text-sm mt-2">
                    {brand.ranking_category
                      ? brand.ranking_category.replace(/_/g, ' ')
                      : 'Varejo / Revenda'}
                  </p>
                </div>

                {brand.exclusivity_zone && (
                  <div className="flex items-center justify-center md:justify-start gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" /> {brand.exclusivity_zone}
                  </div>
                )}

                <p className="text-foreground/80 leading-relaxed max-w-2xl">
                  {brand.bio ||
                    'Esta marca ainda não adicionou uma biografia ao seu perfil. Entre em contato diretamente para saber mais sobre seus produtos e coleções exclusivas.'}
                </p>

                <div className="pt-4">
                  {brand.phone ? (
                    <Button
                      size="lg"
                      className="w-full md:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white"
                      onClick={handleWhatsAppClick}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" /> Falar no WhatsApp
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      disabled
                      variant="outline"
                      className="w-full md:w-auto bg-muted/50"
                    >
                      Contato Indisponível
                    </Button>
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
      </div>
    </main>
  )
}
