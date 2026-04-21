import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShoppingBag, Store, Users, CheckCircle2 } from 'lucide-react'

export default function Index() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[650px] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img
            src="https://img.usecurling.com/p/1920/1080?q=fashion%20editorial&dpr=2"
            alt="Fashion Editorial"
            className="w-full h-full object-cover object-top opacity-50 transition-transform duration-10000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-12">
          <div className="px-5 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-md mb-8 border border-white/20 animate-fade-in-up">
            A Plataforma B2B Definitiva de Moda
          </div>

          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            O Polo da Moda, <br className="hidden md:block" /> Conectado.
          </h1>

          <p
            className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            Descubra as melhores marcas do Brasil, compre no atacado diretamente da fábrica e
            expanda o seu negócio com segurança.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <Button
              size="lg"
              asChild
              className="text-lg px-8 h-14 rounded-full bg-white text-black hover:bg-gray-100 hover:text-black"
            >
              <Link to="/colecoes">
                Explorar Marcas <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-8 h-14 rounded-full bg-black/20 text-white hover:bg-white/30 hover:text-white border-white/30 backdrop-blur-sm"
            >
              <Link to="/revenda">Seja um Revendedor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features / Value Proposition */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Soluções para Todo o Ecossistema
            </h2>
            <p className="text-lg text-muted-foreground">
              A V Moda foi desenvolvida para potencializar vendas, facilitar o acesso aos
              fornecedores e modernizar a jornada de compra e venda no mercado fashion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Manufacturer Card */}
            <div className="flex flex-col items-center text-center p-10 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Store className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Para Fabricantes</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Expanda sua distribuição, gerencie pedidos de atacado com facilidade e alcance
                milhares de lojistas verificados em todo o Brasil.
              </p>
              <ul className="text-sm text-left w-full space-y-3 mb-8 text-muted-foreground">
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-primary mr-2" /> Vitrine digital customizada
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-primary mr-2" /> Gestão de pedidos e
                  logística
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-primary mr-2" /> Acesso a painel de métricas
                </li>
              </ul>
              <Button variant="link" asChild className="mt-auto font-semibold">
                <Link to="/parceiro">
                  Seja um Fabricante <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Retailer Card */}
            <div className="flex flex-col items-center text-center p-10 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-bl-xl z-10">
                Mais Buscado
              </div>
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Para Lojistas</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Acesso direto ao preço de fábrica de mais de 500 marcas, compras unificadas em um
                único carrinho e suporte especializado.
              </p>
              <ul className="text-sm text-left w-full space-y-3 mb-8 text-muted-foreground">
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-primary mr-2" /> Preços direto da fábrica
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-primary mr-2" /> Compra unificada 100%
                  online
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-primary mr-2" /> Frete otimizado e seguro
                </li>
              </ul>
              <Button variant="link" asChild className="mt-auto font-semibold">
                <Link to="/revenda">
                  Quero Comprar no Atacado <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Affiliate Card */}
            <div className="flex flex-col items-center text-center p-10 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Para Afiliados</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Indique novos lojistas, guias e excursões ou promova coleções e ganhe comissões
                atrativas em todas as vendas geradas pela sua rede.
              </p>
              <ul className="text-sm text-left w-full space-y-3 mb-8 text-muted-foreground">
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-primary mr-2" /> Comissionamento recorrente
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-primary mr-2" /> Links personalizados
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-primary mr-2" /> Material de marketing
                  exclusivo
                </li>
              </ul>
              <Button variant="link" asChild className="mt-auto font-semibold">
                <Link to="/afiliados">
                  Programa de Afiliados <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-24 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Descubra as Tendências
              </h2>
              <p className="text-lg text-muted-foreground">
                Navegue pelas categorias mais buscadas e encontre os produtos que são sucesso de
                vendas no mercado nacional.
              </p>
            </div>
            <Button variant="outline" size="lg" className="hidden md:flex rounded-full" asChild>
              <Link to="/colecoes">
                Ver catálogo completo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Moda Feminina',
                image: 'https://img.usecurling.com/p/600/800?q=women%20fashion&dpr=2',
              },
              {
                name: 'Jeanswear',
                image: 'https://img.usecurling.com/p/600/800?q=denim%20jeans&color=blue',
              },
              {
                name: 'Plus Size',
                image: 'https://img.usecurling.com/p/600/800?q=plus%20size%20fashion',
              },
              {
                name: 'Moda Praia',
                image: 'https://img.usecurling.com/p/600/800?q=beachwear&dpr=2',
              },
            ].map((cat, i) => (
              <Link
                key={i}
                to="/colecoes"
                className="group relative rounded-3xl overflow-hidden aspect-[3/4] block shadow-md"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-8">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-2xl font-bold text-white">{cat.name}</h3>
                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Button size="lg" className="w-full rounded-full" asChild>
              <Link to="/colecoes">Ver catálogo completo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="py-32 bg-primary text-primary-foreground px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1920/1080?q=abstract%20fabric&color=black')] opacity-10 mix-blend-multiply object-cover w-full h-full pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-white drop-shadow-sm">
            Pronto para transformar o seu negócio de moda?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 font-light max-w-2xl mx-auto">
            Junte-se a milhares de marcas e lojistas que já estão faturando mais com a plataforma V
            Moda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-lg px-10 h-16 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Link to="/cadastro">Criar Conta Gratuita</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-10 h-16 rounded-full border-white/40 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
            >
              <Link to="/contato">Falar com Consultor</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
