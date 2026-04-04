import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart, MessageSquare, Users, Zap } from 'lucide-react'
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

  const loadMessages = async () => {
    try {
      const data = await pb.collection('messages').getFullList({ sort: '-created' })
      setMessages(data)
    } catch (e) {
      console.error('Error loading messages', e)
    }
  }

  useEffect(() => {
    loadMessages()
    pb.collection('users').getFullList({ sort: '-created' }).then(setTeamUsers).catch(console.error)
  }, [])

  useRealtime('messages', () => {
    loadMessages()
  })

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
