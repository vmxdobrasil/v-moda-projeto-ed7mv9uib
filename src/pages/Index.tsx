import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Store,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Video,
  CheckCircle2,
} from 'lucide-react'

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full py-28 md:py-40 flex flex-col items-center justify-center overflow-hidden bg-black text-white">
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://img.usecurling.com/p/1920/1080?q=fashion%20runway&color=black"
            alt="V Moda Hero"
            className="w-full h-full object-cover opacity-40 scale-105 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
        </div>

        <div className="container relative z-10 px-6 mx-auto text-center space-y-8 max-w-5xl animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-sm font-medium mb-4">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />A plataforma
            definitiva para atacadistas
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg">
            O Maior Hub de Moda{' '}
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              B2B
            </span>{' '}
            do Brasil
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed drop-shadow">
            Conectamos atacadistas, fabricantes e lojistas em um ecossistema único. Negocie por
            vídeo, expanda suas vendas e descubra coleções exclusivas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8">
            <Button
              size="lg"
              className="w-full sm:w-auto text-lg h-14 px-8 shadow-xl shadow-primary/25 transition-transform hover:scale-105"
              asChild
            >
              <Link to="/cadastro">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-lg h-14 px-8 border-white text-white hover:bg-white hover:text-black transition-transform hover:scale-105 backdrop-blur-sm bg-black/20"
              asChild
            >
              <Link to="/colecoes">Explorar Catálogo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-16 bg-white border-b">
        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-gray-100">
            <div className="space-y-3 px-4">
              <h3 className="text-4xl md:text-5xl font-black text-primary">500+</h3>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                Fabricantes
              </p>
            </div>
            <div className="space-y-3 px-4">
              <h3 className="text-4xl md:text-5xl font-black text-primary">10k+</h3>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                Lojistas Ativos
              </p>
            </div>
            <div className="space-y-3 px-4">
              <h3 className="text-4xl md:text-5xl font-black text-primary">50k+</h3>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                Produtos
              </p>
            </div>
            <div className="space-y-3 px-4">
              <h3 className="text-4xl md:text-5xl font-black text-primary">100%</h3>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                Garantia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50/50">
        <div className="container px-6 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">
              Tudo que você precisa para crescer
            </h2>
            <p className="text-xl text-muted-foreground">
              Ferramentas de ponta projetadas especificamente para o mercado de moda atacadista.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8">
                <Store className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Catálogos Digitais</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Crie catálogos interativos, gerencie estoques e receba pedidos de forma automatizada
                e profissional diretamente pelo WhatsApp.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> Gestão simplificada
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> Pedidos no WhatsApp
                </li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8">
                <Video className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Salas de Negociação</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Apresente seus produtos em tempo real com vídeo HD. Feche negócios enquanto o
                cliente visualiza peças com detalhes.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> Vídeo integrado
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> Zero fricção
                </li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Rede de Afiliados</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Indique lojistas e fabricantes e ganhe comissões recorrentes. Monetize sua rede de
                contatos com rastreamento completo.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> Comissões automáticas
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> Dashboard de vendas
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-white">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-4xl font-bold tracking-tight">Polos de Moda & Categorias</h2>
              <p className="text-xl text-muted-foreground">
                Explore os principais segmentos e encontre fornecedores de Goiânia, São Paulo e
                mais.
              </p>
            </div>
            <Button variant="ghost" className="hidden sm:flex self-start md:self-auto" asChild>
              <Link to="/colecoes">
                Ver todas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Moda Feminina', image: 'women fashion model outfit', color: 'pink' },
              { title: 'Jeanswear', image: 'denim fashion catalog', color: 'blue' },
              { title: 'Moda Praia', image: 'beachwear fashion summer', color: 'cyan' },
              { title: 'Plus Size', image: 'plus size fashion elegant', color: 'purple' },
            ].map((category, idx) => (
              <Link
                key={idx}
                to={`/colecoes?category=${category.title.toLowerCase()}`}
                className="group block relative overflow-hidden rounded-3xl aspect-[4/5] shadow-lg"
              >
                <img
                  src={`https://img.usecurling.com/p/600/800?q=${encodeURIComponent(category.image)}&color=${category.color}&dpr=2`}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 p-8 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-white font-bold text-2xl lg:text-3xl drop-shadow-md">
                    {category.title}
                  </h3>
                  <div className="mt-4 flex items-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <span className="font-medium">Explorar marcas</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full mt-10 sm:hidden h-14 text-lg"
            asChild
          >
            <Link to="/colecoes">Ver todas as categorias</Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M0 40L40 0H20L0 20M40 40V20L20 40"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pattern)" />
          </svg>
        </div>
        <div className="container relative z-10 px-6 mx-auto text-center space-y-10 max-w-4xl text-primary-foreground">
          <ShieldCheck className="h-20 w-20 mx-auto opacity-90 drop-shadow-lg" />
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Pronto para transformar suas vendas?
          </h2>
          <p className="text-xl md:text-2xl opacity-90 leading-relaxed font-medium">
            Junte-se a milhares de profissionais da moda que já utilizam a V Moda para fazer
            negócios de forma inteligente, rápida e segura.
          </p>
          <div className="pt-8 flex justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="h-16 px-12 text-xl font-bold shadow-2xl hover:scale-105 transition-transform"
              asChild
            >
              <Link to="/cadastro">Criar Conta Gratuita</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
