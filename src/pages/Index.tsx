import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Users, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://img.usecurling.com/p/1200/800?q=fashion%20models%20runway&color=black"
            alt="Moda Fashion"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
        </div>
        <div className="relative container mx-auto px-4 py-24 sm:py-32 flex flex-col items-center text-center">
          <Badge className="mb-6 bg-white/10 hover:bg-white/20 text-white border-none px-4 py-1.5 text-sm">
            A nova era da moda atacado
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mb-6 animate-fade-in-up">
            Conectando as Melhores Marcas aos Maiores Lojistas
          </h1>
          <p
            className="text-lg sm:text-xl text-zinc-300 max-w-2xl mb-10 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            A V Moda é a plataforma definitiva para negociação B2B no setor de vestuário. Encontre
            fornecedores, gerencie pedidos e escale seu negócio.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <Button
              size="lg"
              className="bg-white text-zinc-950 hover:bg-zinc-200 h-12 px-8"
              asChild
            >
              <Link to="/cadastro">Começar Agora</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 h-12 px-8 bg-transparent"
              asChild
            >
              <Link to="/dashboard">Acessar Painel B2B</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold tracking-tight">500+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Marcas Ativas
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold tracking-tight">12k+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Lojistas
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold tracking-tight">1M+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Produtos
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold tracking-tight">R$ 50M</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Transacionados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Soluções para Todo o Ecossistema
          </h2>
          <p className="text-muted-foreground text-lg">
            Nossa plataforma foi desenhada para atender todas as pontas da cadeia produtiva e
            comercial da moda.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 group bg-card">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Fabricantes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Digitalize seu catálogo, gerencie representantes e receba pedidos de lojistas de
                todo o Brasil sem complicações.
              </p>
              <div className="pt-4">
                <Link
                  to="/painel-fabricante"
                  className="text-primary font-medium hover:underline inline-flex items-center"
                >
                  Ver soluções <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 group bg-card">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Lojistas</h3>
              <p className="text-muted-foreground leading-relaxed">
                Compre direto da fábrica, descubra novas marcas exclusivas e garanta os melhores
                preços para sua vitrine.
              </p>
              <div className="pt-4">
                <Link
                  to="/colecoes"
                  className="text-primary font-medium hover:underline inline-flex items-center"
                >
                  Explorar coleções <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 group bg-card">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Afiliados & Guias</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monetize sua rede de contatos indicando compradores para as fábricas e ganhe
                comissão por cada negócio fechado.
              </p>
              <div className="pt-4">
                <Link
                  to="/afiliados"
                  className="text-primary font-medium hover:underline inline-flex items-center"
                >
                  Programa de parceiros <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-muted/20 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Pólos e Categorias</h2>
              <p className="text-muted-foreground text-lg">
                Explore os principais segmentos em alta
              </p>
            </div>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/colecoes">Ver todos os polos</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Jeans Premium',
                img: 'https://img.usecurling.com/p/400/500?q=jeans%20fashion',
                url: '/colecoes?categoria=jeans',
              },
              {
                name: 'Moda Feminina',
                img: 'https://img.usecurling.com/p/400/500?q=women%20fashion',
                url: '/colecoes?categoria=feminina',
              },
              {
                name: 'Moda Fitness',
                img: 'https://img.usecurling.com/p/400/500?q=fitness%20clothing',
                url: '/colecoes?categoria=fitness',
              },
              {
                name: 'Plus Size',
                img: 'https://img.usecurling.com/p/400/500?q=plus%20size%20model',
                url: '/colecoes?categoria=plussize',
              },
            ].map((cat, i) => (
              <Link
                key={i}
                to={cat.url}
                className="group relative rounded-xl overflow-hidden aspect-[3/4] block bg-zinc-100"
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-bold text-xl">{cat.name}</h3>
                  <div className="flex items-center text-white/80 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    Explorar <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
