import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Heart,
  MessageSquare,
  Users,
  Zap,
  BadgeCheck,
  MessageCircle,
} from 'lucide-react'
import { useSEO } from '@/hooks/useSEO'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { FadeIn } from '@/components/FadeIn'
import { ProductCard } from '@/components/ProductCard'
import { PRODUCTS } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

const HERO_SLIDES = [
  {
    image: 'https://img.usecurling.com/p/1920/1080?q=high%20fashion%20editorial%20dark',
    title: 'Nova Coleção',
    subtitle: 'A elegância encontra o minimalismo contemporâneo.',
  },
  {
    image: 'https://img.usecurling.com/p/1920/1080?q=luxury%20fashion%20model%20studio',
    title: 'Essência Noturna',
    subtitle: 'Silhuetas marcantes para noites inesquecíveis.',
  },
]

const CATEGORIES = [
  {
    name: 'Feminino',
    image: 'https://img.usecurling.com/p/800/1000?q=womens%20high%20fashion',
    link: '/colecoes',
  },
  {
    name: 'Masculino',
    image: 'https://img.usecurling.com/p/800/1000?q=mens%20tailoring%20suit',
    link: '/colecoes',
  },
  {
    name: 'Acessórios',
    image: 'https://img.usecurling.com/p/800/1000?q=luxury%20accessories%20jewelry',
    link: '/colecoes',
  },
]

export default function Index() {
  useSEO({
    title: 'Início',
    description:
      'A elegância encontra o minimalismo contemporâneo na V Moda. Descubra nossas coleções exclusivas de moda feminina, masculina e acessórios.',
  })

  const trendingProducts = PRODUCTS.filter((p) => p.trending).slice(0, 4)

  const [messages, setMessages] = useState<any[]>([])
  const [teamUsers, setTeamUsers] = useState<any[]>([])
  const [resellers, setResellers] = useState<any[]>([])
  const [topPartners, setTopPartners] = useState<any[]>([])
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const [selectedReseller, setSelectedReseller] = useState<any>(null)

  const [leadName, setLeadName] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadMessage, setLeadMessage] = useState('')
  const [isSubmittingLead, setIsSubmittingLead] = useState(false)

  const { toast } = useToast()

  const handleWhatsAppClick = async (e: React.MouseEvent, reseller: any) => {
    e.stopPropagation()
    if (reseller.id) {
      try {
        await pb.send(`/backend/v1/partners/${reseller.id}/click`, { method: 'POST' })
      } catch (err) {
        console.error('Error updating clicks', err)
      }
    }
    window.open(`https://wa.me/${reseller.phone.replace(/\D/g, '')}`, '_blank')
  }

  const loadMessages = async () => {
    try {
      const data = await pb.collection('messages').getFullList({ sort: '-created' })
      setMessages(data)
    } catch (e) {
      console.error('Error loading messages', e)
    }
  }

  const loadResellers = async () => {
    try {
      const data = await pb.collection('customers').getFullList({
        sort: '-created',
        filter: "status = 'converted' || avatar != ''",
      })
      setResellers(data)
    } catch (e) {
      console.error('Error loading resellers', e)
    }
  }

  const loadTopPartners = async () => {
    try {
      const data = await pb.collection('customers').getFullList({
        sort: '-whatsapp_clicks',
      })
      setTopPartners(data.slice(0, 5))
    } catch (e) {
      console.error('Error loading top partners', e)
    }
  }

  useEffect(() => {
    loadMessages()
    loadResellers()
    loadTopPartners()
    pb.collection('users').getFullList({ sort: '-created' }).then(setTeamUsers).catch(console.error)
  }, [])

  useRealtime('messages', () => {
    loadMessages()
  })

  useRealtime('customers', () => {
    loadResellers()
    loadTopPartners()
  })

  const outboundCount = messages.filter((m) => m.direction === 'outbound').length
  const inboundCount = messages.filter((m) => m.direction === 'inbound').length
  const responseRate = outboundCount > 0 ? Math.round((inboundCount / outboundCount) * 100) : 0

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const activeConversations = new Set(
    messages.filter((m) => new Date(m.created).getTime() > sevenDaysAgo).map((m) => m.sender_id),
  ).size

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadName || !leadEmail || !selectedReseller?.manufacturer) return

    setIsSubmittingLead(true)
    try {
      await pb.send('/backend/v1/partners/lead', {
        method: 'POST',
        body: JSON.stringify({
          manufacturer: selectedReseller.manufacturer,
          partnerName: selectedReseller.name,
          name: leadName,
          email: leadEmail,
          message: leadMessage,
        }),
      })
      toast({
        title: 'Sucesso!',
        description: 'Your interest has been sent to the manufacturer!',
      })
      setLeadName('')
      setLeadEmail('')
      setLeadMessage('')
      setSelectedReseller(null)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Could not send your interest. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmittingLead(false)
    }
  }

  return (
    <main className="w-full pb-24">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden bg-black">
        <Carousel
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 6000 })]}
          className="h-full w-full"
        >
          <CarouselContent className="h-full ml-0">
            {HERO_SLIDES.map((slide, index) => (
              <CarouselItem key={index} className="pl-0 h-full relative">
                <div className="absolute inset-0 bg-black/30 z-10" />
                <img
                  src={slide.image}
                  alt={`Imagem da coleção: ${slide.title}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white text-center px-4">
                  <FadeIn delay={200}>
                    <p className="text-sm md:text-base uppercase tracking-[0.3em] mb-4 text-white/90">
                      {slide.subtitle}
                    </p>
                  </FadeIn>
                  <FadeIn delay={400}>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-8 text-balance">
                      {slide.title}
                    </h1>
                  </FadeIn>
                  <FadeIn delay={600}>
                    <Link
                      to="/colecoes"
                      className="inline-flex items-center justify-center bg-white text-black px-8 py-4 uppercase tracking-widest text-sm font-medium transition-all hover:bg-black hover:text-white hover:scale-105 duration-300"
                    >
                      Ver Coleção
                    </Link>
                  </FadeIn>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/70 animate-bounce">
          <span className="text-xs uppercase tracking-widest">Rolar</span>
          <div className="w-[1px] h-12 bg-white/50" />
        </div>
      </section>

      {/* Messaging Insights Section */}
      <section className="py-16 md:py-24 bg-muted/20 border-b border-border">
        <div className="container">
          <FadeIn>
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-serif mb-4">Messaging Insights</h2>
              <p className="text-muted-foreground max-w-2xl">
                Acompanhe o desempenho das suas campanhas e comunicações automatizadas via WhatsApp
                em tempo real.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-background/60 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total de Mensagens Enviadas</CardTitle>
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{outboundCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Campanhas automatizadas e manuais
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-background/60 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeConversations}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contatos únicos nos últimos 7 dias
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-background/60 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
                  <Zap className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{responseRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Proporção de recebidas vs enviadas
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Logs de Mensagens ao Vivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.slice(0, 5).map((msg) => (
                    <div
                      key={msg.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/40 border rounded-lg hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {msg.sender_name || msg.sender_id || 'Desconhecido'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.created).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{msg.content}</p>
                      </div>
                      <Badge
                        variant={
                          msg.status === 'pending'
                            ? 'secondary'
                            : msg.status === 'replied'
                              ? 'default'
                              : 'outline'
                        }
                        className="self-start sm:self-auto shrink-0"
                      >
                        {msg.status === 'pending'
                          ? 'Pendente'
                          : msg.status === 'replied'
                            ? 'Respondido'
                            : msg.status}
                      </Badge>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      Nenhuma mensagem registrada no sistema ainda.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* Novidades Section */}
      <section className="py-24 md:py-32 container">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-4">Novidades</h2>
              <p className="text-muted-foreground max-w-md">
                Descubra as últimas tendências e lançamentos da nossa nova coleção.
              </p>
            </div>
            <Link
              to="/colecoes"
              className="group flex items-center gap-2 text-sm uppercase tracking-widest font-medium border-b border-primary pb-1 hover:text-accent hover:border-accent transition-colors"
            >
              Ver Todas as Novidades{' '}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {PRODUCTS.slice(0, 4).map((product, i) => (
            <FadeIn key={product.id} delay={i * 100}>
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Destaques Section */}
      <section className="py-24 md:py-32 container bg-secondary/20">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-4">Destaques</h2>
              <p className="text-muted-foreground max-w-md">
                As peças mais avaliadas e desejadas pelos nossos clientes.
              </p>
            </div>
            <Link
              to="/colecoes"
              className="group flex items-center gap-2 text-sm uppercase tracking-widest font-medium border-b border-primary pb-1 hover:text-accent hover:border-accent transition-colors"
            >
              Ver Todos os Destaques{' '}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {trendingProducts.map((product, i) => (
            <FadeIn key={product.id} delay={i * 100}>
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-secondary/50">
        <div className="container">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-serif text-center mb-16">Nossas Linhas</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CATEGORIES.map((category, i) => (
              <FadeIn key={category.name} delay={i * 150}>
                <Link
                  to={category.link}
                  className="group relative block aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-muted"
                >
                  <img
                    src={category.image}
                    alt={`Categoria de produtos: ${category.name}`}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-3xl font-serif text-white tracking-wide drop-shadow-lg group-hover:scale-110 transition-transform duration-500">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-24 md:py-32 bg-secondary/10 border-y border-border mb-24">
        <div className="container text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Siga-nos no Instagram @revistamodaatual
            </h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
              Acompanhe nossos bastidores, novas coleções e inspirações diárias diretamente no nosso
              feed.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              'https://img.usecurling.com/p/400/400?q=fashion%20model%20street%20style',
              'https://img.usecurling.com/p/400/400?q=minimalist%20clothing%20detail',
              'https://img.usecurling.com/p/400/400?q=fashion%20accessories%20jewelry',
              'https://img.usecurling.com/p/400/400?q=luxury%20fashion%20editorial',
            ].map((img, i) => (
              <FadeIn
                key={i}
                delay={i * 100}
                className="relative aspect-square group overflow-hidden bg-muted"
              >
                <img
                  src={img}
                  alt={`Publicação do Instagram da V Moda ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={400}>
            <a
              href="https://www.instagram.com/revistamodaatual"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border-2 border-primary px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Ver no Instagram
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Top Partners Section */}
      <section className="py-24 bg-background border-t border-border">
        <div className="container">
          <FadeIn>
            <div className="flex flex-col items-center mb-16 text-center">
              <h2 className="text-3xl md:text-4xl font-serif mb-4">Top Partners</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Os parceiros mais procurados e engajados da nossa plataforma.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {topPartners.map((partner, i) => (
              <FadeIn
                key={partner.id}
                delay={i * 100}
                className="relative text-center group cursor-pointer hover:bg-muted/50 p-6 rounded-2xl border shadow-sm transition-all hover:-translate-y-1"
                onClick={() => setSelectedReseller(partner)}
              >
                {i < 3 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] uppercase font-bold tracking-wider py-1 px-3 rounded-full shadow-md z-10">
                    Trending
                  </div>
                )}
                <div className="relative mx-auto mb-4 w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-lg">
                  {partner.avatar ? (
                    <img
                      src={pb.files.getUrl(partner, partner.avatar, { thumb: '200x200' })}
                      alt={partner.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <img
                      src={`https://img.usecurling.com/ppl/medium?seed=${i + 100}&gender=female`}
                      alt="Avatar"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90"
                    />
                  )}
                </div>
                <h3
                  className="font-serif text-lg truncate px-2 flex items-center justify-center gap-1 mb-1"
                  title={partner.name}
                >
                  {partner.name}
                  {partner.is_verified && (
                    <BadgeCheck className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                </h3>
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground mb-4">
                  <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                  {partner.whatsapp_clicks || 0} contatos
                </div>
                {partner.phone && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    onClick={(e) => handleWhatsAppClick(e, partner)}
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                    WhatsApp
                  </Button>
                )}
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Lojas e Revendedoras Section */}
      <section className="py-24 bg-muted/10 border-t border-border">
        <div className="container">
          <FadeIn>
            <div className="flex flex-col items-center mb-16 space-y-6">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-serif mb-4">Lojas e Revendedoras</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Conheça as lojas e revendedoras parceiras que levam a V Moda até você. Valorizamos
                  fotos reais para uma experiência mais próxima e humana.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full shadow-sm border">
                <Switch
                  id="verified-only"
                  checked={showVerifiedOnly}
                  onCheckedChange={setShowVerifiedOnly}
                />
                <Label htmlFor="verified-only" className="cursor-pointer text-sm font-medium">
                  Mostrar apenas verificados
                </Label>
              </div>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {resellers.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <FadeIn key={i} delay={i * 100} className="text-center group">
                  <div className="relative mx-auto mb-4 w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-background shadow-lg">
                    <img
                      src={`https://img.usecurling.com/ppl/medium?seed=${i + 60}&gender=female`}
                      alt="Avatar"
                      className="w-full h-full object-cover opacity-90"
                    />
                  </div>
                  <div className="h-4 bg-muted rounded w-24 mx-auto mb-2" />
                  <div className="h-3 bg-muted rounded w-16 mx-auto mb-2" />
                </FadeIn>
              ))
            ) : resellers.filter((r) => (showVerifiedOnly ? r.is_verified : true)).length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Nenhum parceiro verificado encontrado.
              </div>
            ) : (
              resellers
                .filter((r) => (showVerifiedOnly ? r.is_verified : true))
                .slice(0, 10)
                .map((reseller: any, i) => (
                  <FadeIn
                    key={reseller.id}
                    delay={i * 100}
                    className="text-center group cursor-pointer hover:bg-muted/50 p-4 rounded-xl transition-colors"
                    onClick={() => setSelectedReseller(reseller)}
                  >
                    <div className="relative mx-auto mb-4 w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-background shadow-lg">
                      {reseller.avatar ? (
                        <img
                          src={pb.files.getUrl(reseller, reseller.avatar, { thumb: '200x200' })}
                          alt={reseller.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <img
                          src={`https://img.usecurling.com/ppl/medium?seed=${i + 60}&gender=female`}
                          alt="Avatar"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90"
                        />
                      )}
                    </div>
                    <h3
                      className="font-serif text-base md:text-lg truncate px-2 flex items-center justify-center gap-1"
                      title={reseller.name}
                    >
                      {reseller.name}
                      {reseller.is_verified && (
                        <BadgeCheck className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground capitalize mb-3">
                      {reseller.ranking_category
                        ? reseller.ranking_category.replace(/_/g, ' ')
                        : 'Varejo / Revenda'}
                    </p>
                    {reseller.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full max-w-[140px] mx-auto h-8 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        onClick={(e) => handleWhatsAppClick(e, reseller)}
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                        WhatsApp
                      </Button>
                    )}
                  </FadeIn>
                ))
            )}
          </div>
        </div>
      </section>

      {/* Partner Detail Modal */}
      <Dialog open={!!selectedReseller} onOpenChange={(open) => !open && setSelectedReseller(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedReseller && (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">Detalhes do Parceiro</DialogTitle>
                <DialogDescription className="sr-only">
                  Informações sobre {selectedReseller.name}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center text-center space-y-4 pt-4">
                <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                  <AvatarImage
                    src={
                      selectedReseller.avatar
                        ? pb.files.getUrl(selectedReseller, selectedReseller.avatar, {
                            thumb: '200x200',
                          })
                        : `https://img.usecurling.com/ppl/medium?seed=99&gender=female`
                    }
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl">
                    {selectedReseller.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-serif flex items-center justify-center gap-2">
                    {selectedReseller.name}
                    {selectedReseller.is_verified && (
                      <BadgeCheck className="w-6 h-6 text-green-500" title="Parceiro Verificado" />
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize mt-1">
                    {selectedReseller.ranking_category
                      ? selectedReseller.ranking_category.replace(/_/g, ' ')
                      : 'Varejo / Revenda'}
                  </p>
                </div>
                {selectedReseller.bio && (
                  <p className="text-sm text-foreground/80 leading-relaxed max-w-sm">
                    {selectedReseller.bio}
                  </p>
                )}

                <div className="w-full mt-6 text-left border-t pt-6">
                  <h4 className="font-semibold mb-4 text-sm">I'm Interested (Express Interest)</h4>
                  <form onSubmit={handleLeadSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="leadName" className="text-xs">
                        Name *
                      </Label>
                      <Input
                        id="leadName"
                        required
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder="Your full name"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="leadEmail" className="text-xs">
                        Email *
                      </Label>
                      <Input
                        id="leadEmail"
                        type="email"
                        required
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="leadMessage" className="text-xs">
                        Message / Product Interest
                      </Label>
                      <Textarea
                        id="leadMessage"
                        value={leadMessage}
                        onChange={(e) => setLeadMessage(e.target.value)}
                        placeholder="What are you interested in?"
                        className="resize-none h-16 text-sm"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmittingLead}
                      className="w-full h-8 text-xs"
                    >
                      {isSubmittingLead ? 'Sending...' : 'Express Interest'}
                    </Button>
                  </form>
                </div>

                {selectedReseller.phone && (
                  <Button
                    className="w-full mt-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
                    size="lg"
                    onClick={(e) => handleWhatsAppClick(e, selectedReseller)}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contact on WhatsApp
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Nossa Equipe Section */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="container">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif mb-4">Nossa Equipe</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Os profissionais por trás da excelência e curadoria V Moda.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {(teamUsers.length > 0
              ? teamUsers.slice(0, 4)
              : [
                  {
                    id: '1',
                    name: 'Ana Silva',
                    avatar: null,
                    role: 'Diretora Criativa',
                    seed: 1,
                    gender: 'female',
                  },
                  {
                    id: '2',
                    name: 'Carlos Santos',
                    avatar: null,
                    role: 'Estilista Chefe',
                    seed: 2,
                    gender: 'male',
                  },
                  {
                    id: '3',
                    name: 'Marina Costa',
                    avatar: null,
                    role: 'Gerente de Produção',
                    seed: 3,
                    gender: 'female',
                  },
                  {
                    id: '4',
                    name: 'Roberto Almeida',
                    avatar: null,
                    role: 'Marketing',
                    seed: 4,
                    gender: 'male',
                  },
                ]
            ).map((user, i) => (
              <FadeIn key={user.id} delay={i * 100} className="text-center group">
                <div className="relative mx-auto mb-4 w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-lg">
                  <img
                    src={
                      user.avatar
                        ? pb.files.getUrl(user, user.avatar, { thumb: '200x200' })
                        : `https://img.usecurling.com/ppl/medium?seed=${user.seed || i + 10}&gender=${user.gender || 'female'}`
                    }
                    alt={user.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="font-serif text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {user.role || 'Especialista de Moda'}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Fabricantes Section */}
      <section className="py-24 container">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Fabricantes Parceiros</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Marcas exclusivas que confiam na nossa plataforma para alavancar suas vendas e
              construir portfólios incríveis.
            </p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 items-center justify-items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
          {(teamUsers.length > 0 ? teamUsers.slice(0, 6) : Array.from({ length: 6 })).map(
            (user: any, i) => (
              <FadeIn key={user?.id || i} delay={i * 100}>
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-secondary/30 flex items-center justify-center overflow-hidden p-4 border hover:border-primary transition-colors cursor-pointer">
                  {user?.avatar ? (
                    <img
                      src={pb.files.getUrl(user, user.avatar, { thumb: '100x100' })}
                      alt={user.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <img
                      src={`https://img.usecurling.com/i?q=brand%20logo&shape=outline&color=black&seed=${i + 20}`}
                      alt="Logo Parceiro"
                      className="max-w-full max-h-full object-contain opacity-60"
                    />
                  )}
                </div>
              </FadeIn>
            ),
          )}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/portfolio"
            className="inline-flex items-center justify-center border-b border-primary pb-1 text-sm uppercase tracking-widest font-medium hover:text-accent hover:border-accent transition-colors"
          >
            Ver Portfólio de Projetos
          </Link>
        </div>
      </section>

      {/* Editorial Section */}
      <section className="py-24 md:py-32 container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <FadeIn className="relative aspect-[4/5] lg:aspect-auto lg:h-[800px] overflow-hidden">
            <img
              src="https://img.usecurling.com/p/800/1000?q=fashion%20editorial%20minimalist%20architecture"
              alt="Inspiração Editorial Minimalista"
              className="w-full h-full object-cover"
            />
          </FadeIn>
          <div className="flex flex-col justify-center">
            <FadeIn delay={200}>
              <span className="text-sm uppercase tracking-[0.2em] text-accent font-medium mb-6 block">
                Style Story
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-8 leading-tight">
                A Arte da
                <br />
                Simplicidade
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                Nossa nova coleção é uma ode ao design essencial. Exploramos a pureza das linhas
                retas e a riqueza das texturas naturais para criar peças que transcendem estações.
                Cada costura é intencional, cada silhueta é pensada para empoderar.
              </p>
              <Link
                to="/colecoes"
                className="inline-flex items-center justify-center border-2 border-primary px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground self-start"
              >
                Ler Editorial Completo
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>
    </main>
  )
}
