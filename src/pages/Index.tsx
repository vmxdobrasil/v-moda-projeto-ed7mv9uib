import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  ShoppingBag,
  Store,
  Users,
  PlayCircle,
  Star,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://img.usecurling.com/p/1920/1080?q=fashion%20models"
            alt="Fashion Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        </div>

        <div className="relative z-10 container px-4 md:px-6 w-full pt-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>A Nova Era do Atacado de Moda</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-white drop-shadow-sm">
              Conectando o{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500">
                Melhor da Moda
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-10 text-gray-200 max-w-2xl leading-relaxed">
              O ecossistema definitivo para fabricantes, lojistas e guias. Negocie, compre no
              atacado e gerencie suas vendas com ferramentas de ponta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                asChild
                className="bg-white text-black hover:bg-gray-100 font-semibold h-12 px-8"
              >
                <Link to="/colecoes">
                  Explorar Coleções <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm font-semibold h-12 px-8"
              >
                <Link to="/cadastro">Seja um Parceiro</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-zinc-950">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Um Ecossistema Completo
            </h2>
            <p className="text-muted-foreground text-lg">
              Soluções sob medida para cada etapa da cadeia produtiva e comercial da moda.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                <Store className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Fabricantes</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Digitalize seu catálogo, alcance novos lojistas em todo o Brasil e gerencie suas
                vendas B2B e B2C com nosso CRM especializado.
              </p>
              <Button
                variant="ghost"
                asChild
                className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700 hover:bg-transparent"
              >
                <Link to="/cadastro">
                  Criar Loja <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-pink-50 dark:bg-pink-900/20 rounded-2xl flex items-center justify-center text-pink-600 dark:text-pink-400 mb-6">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Lojistas</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Compre no atacado diretamente das melhores marcas. Negocie por vídeo, rastreie suas
                excursões e aproveite o clube de benefícios.
              </p>
              <Button
                variant="ghost"
                asChild
                className="p-0 h-auto font-semibold text-pink-600 hover:text-pink-700 hover:bg-transparent"
              >
                <Link to="/cadastro">
                  Ver Marcas <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Guias & Afiliados</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Monetize sua carteira de clientes. Indique lojistas para as fábricas parceiras,
                acompanhe suas conversões e ganhe comissões exclusivas.
              </p>
              <Button
                variant="ghost"
                asChild
                className="p-0 h-auto font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-transparent"
              >
                <Link to="/afiliados">
                  Programa de Afiliados <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Principais Segmentos
              </h2>
              <p className="text-muted-foreground text-lg">
                Encontre as confecções ideais navegando pelos polos e categorias mais procuradas.
              </p>
            </div>
            <Button variant="outline" size="lg" asChild className="shrink-0 rounded-full">
              <Link to="/colecoes">Ver Catálogo Completo</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Moda Feminina',
                image: 'https://img.usecurling.com/p/600/800?q=women%20fashion%20summer',
              },
              {
                name: 'Jeans & Denim',
                image: 'https://img.usecurling.com/p/600/800?q=jeans%20denim%20apparel',
              },
              {
                name: 'Moda Praia',
                image: 'https://img.usecurling.com/p/600/800?q=beachwear%20swimsuit%20bikini',
              },
              {
                name: 'Moda Fitness',
                image: 'https://img.usecurling.com/p/600/800?q=fitness%20apparel%20gym',
              },
            ].map((category, i) => (
              <Link
                key={i}
                to="/colecoes"
                className="group relative overflow-hidden rounded-3xl aspect-[3/4] block bg-zinc-100 dark:bg-zinc-900"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                  <div>
                    <h3 className="text-white font-bold text-2xl mb-2">{category.name}</h3>
                    <span className="text-white/80 text-sm font-medium flex items-center opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      Explorar Lojas <ArrowRight className="ml-1 w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-zinc-950 text-zinc-50 rounded-[3rem] mx-4 md:mx-6 mb-12">
        <div className="container px-4 md:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white text-sm font-medium mb-6">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Plataforma Segura</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                Inovação e confiança em cada transação.
              </h2>
              <ul className="space-y-8">
                <li className="flex items-start gap-5">
                  <div className="mt-1 bg-white/10 p-3 rounded-2xl shrink-0">
                    <PlayCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Negociação por Vídeo Ao Vivo</h4>
                    <p className="text-zinc-400 leading-relaxed">
                      Conecte-se com o representante da fábrica e veja os detalhes das peças em
                      tempo real antes de fechar o pedido.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-5">
                  <div className="mt-1 bg-white/10 p-3 rounded-2xl shrink-0">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Vantagens V Moda</h4>
                    <p className="text-zinc-400 leading-relaxed">
                      Programa de pontos exclusivo. Quanto mais você compra, mais benefícios,
                      brindes e descontos você destrava.
                    </p>
                  </div>
                </li>
              </ul>

              <div className="mt-12 pt-12 border-t border-white/10 flex flex-wrap gap-8">
                <div>
                  <p className="text-4xl font-extrabold mb-1">1.2k+</p>
                  <p className="text-zinc-400 font-medium">Marcas Ativas</p>
                </div>
                <div>
                  <p className="text-4xl font-extrabold mb-1">15k+</p>
                  <p className="text-zinc-400 font-medium">Lojistas no Brasil</p>
                </div>
                <div>
                  <p className="text-4xl font-extrabold mb-1">R$ 50M</p>
                  <p className="text-zinc-400 font-medium">Volume Negociado</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />
              <img
                src="https://img.usecurling.com/p/800/900?q=business%20meeting%20fashion%20designer"
                alt="Business Meeting"
                className="relative rounded-[2.5rem] shadow-2xl object-cover w-full aspect-[4/5] md:aspect-[3/4]"
              />

              {/* Floating badge */}
              <div className="absolute top-8 -left-8 md:-left-12 bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-xl text-foreground flex items-center gap-4 animate-fade-in-up">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold">Lojas Verificadas</p>
                  <p className="text-sm text-muted-foreground">100% de garantia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
