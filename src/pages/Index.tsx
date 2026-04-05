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
  MapPin,
  LayoutGrid,
  Map as MapIcon,
  Trophy,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useSEO } from '@/hooks/useSEO'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { FadeIn } from '@/components/FadeIn'
import { ProductCard } from '@/components/ProductCard'
import { PRODUCTS } from '@/lib/data'
import { useNavigate } from 'react-router-dom'
import { FavoriteButton } from '@/components/FavoriteButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
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
  const [top60Brands, setTop60Brands] = useState<any[]>([])
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('')
  const [selectedReseller, setSelectedReseller] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')

  const { toast } = useToast()
  const navigate = useNavigate()

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

  const loadTop60Brands = async () => {
    try {
      const data = await pb.collection('customers').getFullList({
        filter: "ranking_position > 0 && status = 'converted'",
        sort: 'ranking_category,ranking_position',
      })
      setTop60Brands(data)
    } catch (e) {
      console.error('Error loading top 60 brands', e)
    }
  }

  useEffect(() => {
    loadMessages()
    loadResellers()
    loadTopPartners()
    loadTop60Brands()
    pb.collection('users').getFullList({ sort: '-created' }).then(setTeamUsers).catch(console.error)
  }, [])

  useRealtime('messages', () => {
    loadMessages()
  })

  useRealtime('customers', () => {
    loadResellers()
    loadTopPartners()
    loadTop60Brands()
  })

  const TOP_CATEGORIES = [
    { id: 'moda_feminina', label: 'TOP 15 MODA FEMININA' },
    { id: 'jeans', label: 'TOP 10 JEANS' },
    { id: 'moda_praia', label: 'TOP 5 MODA PRAIA' },
    { id: 'moda_masculina', label: 'TOP 5 MODA MASCULINA' },
    { id: 'moda_fitness', label: 'TOP 5 MODA FITNESS' },
    { id: 'moda_evangelica', label: 'TOP 5 MODA EVANGÉLICA' },
    { id: 'moda_country', label: 'TOP 5 MODA COUNTRY' },
    { id: 'moda_infantil', label: 'TOP 5 MODA INFANTIL/JUVENIL' },
    { id: 'bijouterias_semijoias', label: 'TOP 3 BIJOUTERIAS E SEMI JOIAS' },
    { id: 'calcados', label: 'TOP 2 CALÇADOS' },
  ]

  const getMedalColor = (position: number) => {
    if (position === 1) return 'bg-yellow-400 text-yellow-900 shadow-yellow-200'
    if (position === 2) return 'bg-slate-300 text-slate-800 shadow-slate-200'
    if (position === 3) return 'bg-amber-600 text-amber-50 shadow-amber-200'
    return 'bg-muted text-muted-foreground'
  }

  const outboundCount = messages.filter((m) => m.direction === 'outbound').length
  const inboundCount = messages.filter((m) => m.direction === 'inbound').length
  const responseRate = outboundCount > 0 ? Math.round((inboundCount / outboundCount) * 100) : 0

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const activeConversations = new Set(
    messages.filter((m) => new Date(m.created).getTime() > sevenDaysAgo).map((m) => m.sender_id),
  ).size

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
                className="relative text-center group cursor-pointer hover:bg-muted/50 p-6 rounded-2xl border shadow-sm transition-all hover:-translate-y-1 block"
                onClick={() => navigate(`/marcas/${partner.id}`)}
              >
                <div className="absolute top-2 right-2 z-20">
                  <FavoriteButton brandId={partner.id} />
                </div>
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

      {/* Top 60 Ranking Section */}
      <section className="py-24 bg-muted/5 border-t border-border">
        <div className="container">
          <FadeIn>
            <div className="flex flex-col items-center mb-12 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-serif mb-4 flex flex-col md:flex-row items-center justify-center gap-3">
                <span className="text-center text-2xl md:text-4xl">
                  TOP 60 das melhores marcas da
                </span>
                <Badge
                  variant="default"
                  className="text-sm md:text-lg font-sans tracking-widest px-4 py-1.5 whitespace-normal text-center h-auto inline-flex leading-snug"
                >
                  REVISTA MODA ATUAL DIGITAL
                </Badge>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Conheça a seleção exclusiva feita pela Revista Moda Atual Digital. Os parceiros de
                destaque no Goiás Fashion Hub, classificados por segmento e excelência.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <Tabs defaultValue="moda_feminina" className="w-full">
              <ScrollArea className="w-full max-w-full whitespace-nowrap mb-8">
                <TabsList className="inline-flex w-max space-x-2 bg-transparent p-1 h-auto">
                  {TOP_CATEGORIES.map((cat) => (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background hover:bg-muted transition-colors"
                    >
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" className="invisible" />
              </ScrollArea>

              {TOP_CATEGORIES.map((cat) => (
                <TabsContent key={cat.id} value={cat.id} className="mt-0 outline-none">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {top60Brands
                      .filter((b) => b.ranking_category === cat.id)
                      .sort((a, b) => a.ranking_position - b.ranking_position)
                      .map((brand, i) => (
                        <Card
                          key={brand.id}
                          className="relative overflow-hidden group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-border/50"
                          onClick={() => navigate(`/marcas/${brand.id}`)}
                        >
                          <div className="absolute top-2 right-2 z-20">
                            <FavoriteButton brandId={brand.id} />
                          </div>
                          <div
                            className={`absolute top-0 left-0 w-12 h-12 flex items-start justify-start p-2 rounded-br-2xl shadow-sm z-10 ${getMedalColor(
                              brand.ranking_position,
                            )}`}
                          >
                            <span className="font-bold text-sm tracking-tighter">
                              #{brand.ranking_position}
                            </span>
                          </div>
                          <CardContent className="p-6 flex flex-col items-center text-center pt-8">
                            <Avatar className="w-20 h-20 mb-4 border-2 border-background shadow-md">
                              <AvatarImage
                                src={
                                  brand.avatar
                                    ? pb.files.getUrl(brand, brand.avatar, { thumb: '200x200' })
                                    : `https://img.usecurling.com/ppl/medium?seed=${
                                        brand.id || i + 200
                                      }&gender=female`
                                }
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <AvatarFallback>
                                {brand.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <h4
                              className="font-serif font-medium text-lg flex items-center justify-center gap-1.5 w-full truncate px-2"
                              title={brand.name}
                            >
                              <span className="truncate">{brand.name}</span>
                              {brand.is_verified && (
                                <BadgeCheck className="w-4 h-4 text-green-500 shrink-0" />
                              )}
                            </h4>
                            <p className="text-xs text-muted-foreground capitalize mt-1">
                              {brand.ranking_category.replace(/_/g, ' ')}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    {top60Brands.filter((b) => b.ranking_category === cat.id).length === 0 && (
                      <div className="col-span-full py-12 text-center text-muted-foreground">
                        Nenhuma marca ranqueada nesta categoria ainda.
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </FadeIn>
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
              <div className="flex justify-center mb-6">
                <div className="bg-muted p-1 rounded-lg inline-flex">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Grade
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'map' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <MapIcon className="w-4 h-4" />
                    Mapa
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-4xl bg-background p-4 rounded-xl shadow-sm border mt-6">
                <div className="flex-1 w-full space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Categoria</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todas as Categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Categorias</SelectItem>
                      <SelectItem value="moda_feminina">Moda Feminina</SelectItem>
                      <SelectItem value="jeans">Jeans</SelectItem>
                      <SelectItem value="moda_praia">Moda Praia</SelectItem>
                      <SelectItem value="moda_geral">Moda Geral</SelectItem>
                      <SelectItem value="moda_masculina">Moda Masculina</SelectItem>
                      <SelectItem value="moda_fitness">Moda Fitness</SelectItem>
                      <SelectItem value="moda_evangelica">Moda Evangélica</SelectItem>
                      <SelectItem value="moda_country">Moda Country</SelectItem>
                      <SelectItem value="moda_infantil">Moda Infantil</SelectItem>
                      <SelectItem value="bijouterias_semijoias">Bijouterias / Semijoias</SelectItem>
                      <SelectItem value="calcados">Calçados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 w-full space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Localização / Zona</Label>
                  <Input
                    placeholder="Buscar por cidade ou região..."
                    value={zoneFilter}
                    onChange={(e) => setZoneFilter(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="flex items-center gap-2 h-9 mt-5 px-4 bg-muted/50 rounded-lg border border-transparent">
                  <Switch
                    id="verified-only"
                    checked={showVerifiedOnly}
                    onCheckedChange={setShowVerifiedOnly}
                  />
                  <Label
                    htmlFor="verified-only"
                    className="cursor-pointer text-sm whitespace-nowrap font-medium"
                  >
                    Somente Verificados
                  </Label>
                </div>
              </div>
            </div>
          </FadeIn>
          {viewMode === 'grid' ? (
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
              ) : resellers.filter((r) => {
                  if (showVerifiedOnly && !r.is_verified) return false
                  if (categoryFilter !== 'all' && r.ranking_category !== categoryFilter)
                    return false
                  if (
                    zoneFilter &&
                    !r.exclusivity_zone?.toLowerCase().includes(zoneFilter.toLowerCase())
                  )
                    return false
                  return true
                }).length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Nenhum parceiro encontrado com os filtros selecionados.
                </div>
              ) : (
                resellers
                  .filter((r) => {
                    if (showVerifiedOnly && !r.is_verified) return false
                    if (categoryFilter !== 'all' && r.ranking_category !== categoryFilter)
                      return false
                    if (
                      zoneFilter &&
                      !r.exclusivity_zone?.toLowerCase().includes(zoneFilter.toLowerCase())
                    )
                      return false
                    return true
                  })
                  .slice(0, 10)
                  .map((reseller: any, i) => (
                    <FadeIn
                      key={reseller.id}
                      delay={i * 100}
                      className="relative text-center group cursor-pointer hover:bg-muted/50 p-4 rounded-xl transition-colors block"
                      onClick={() => navigate(`/marcas/${reseller.id}`)}
                    >
                      <div className="absolute top-2 right-2 z-20">
                        <FavoriteButton brandId={reseller.id} />
                      </div>
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
          ) : (
            <FadeIn>
              <div className="w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden border relative bg-[#e5e3df]">
                <img
                  src="https://img.usecurling.com/p/1200/800?q=google%20maps%20view%20clean%20light"
                  alt="Mapa de Parceiros"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 bg-background/90 backdrop-blur p-4 rounded-lg shadow-lg z-10 border">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Mapa de Parceiros
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Explore a distribuição geográfica das nossas lojas e revendedoras autorizadas.
                    Clique nos marcadores para ver mais detalhes.
                  </p>
                </div>
                {resellers
                  .filter((r) => {
                    if (showVerifiedOnly && !r.is_verified) return false
                    if (categoryFilter !== 'all' && r.ranking_category !== categoryFilter)
                      return false
                    if (
                      zoneFilter &&
                      !r.exclusivity_zone?.toLowerCase().includes(zoneFilter.toLowerCase())
                    )
                      return false
                    return true
                  })
                  .map((reseller: any) => {
                    let hash = 0
                    const str = reseller.exclusivity_zone || reseller.id
                    for (let i = 0; i < str.length; i++) {
                      hash = str.charCodeAt(i) + ((hash << 5) - hash)
                    }
                    const x = 15 + (Math.abs(hash) % 70)
                    const y = 15 + (Math.abs(hash >> 8) % 70)

                    return (
                      <div
                        key={reseller.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                        style={{ left: `${x}%`, top: `${y}%` }}
                        onClick={() => navigate(`/marcas/${reseller.id}`)}
                      >
                        <MapPin className="w-8 h-8 text-primary drop-shadow-lg group-hover:scale-125 group-hover:-translate-y-2 group-hover:text-accent transition-all duration-300" />
                        {reseller.is_verified && (
                          <div className="absolute -top-1 -right-1 bg-background rounded-full">
                            <BadgeCheck className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-background px-3 py-1.5 text-xs font-bold rounded shadow-xl opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity border flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1">{reseller.name}</div>
                          {reseller.exclusivity_zone && (
                            <span className="text-[10px] font-normal text-muted-foreground">
                              {reseller.exclusivity_zone}
                            </span>
                          )}
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-background border-r border-b rotate-45"></div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </FadeIn>
          )}

          <FadeIn delay={200} className="mt-16 text-center">
            <Button
              asChild
              size="lg"
              className="rounded-none px-8 py-6 text-sm uppercase tracking-widest font-bold shadow-lg transition-transform hover:scale-105"
            >
              <Link to="/guia-de-moda">Ver Guia Completo (1000+ marcas)</Link>
            </Button>
          </FadeIn>
        </div>
      </section>

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
