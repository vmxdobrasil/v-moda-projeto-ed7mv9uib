import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, TrendingUp, Users, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen w-full animate-fade-in">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-muted overflow-hidden flex-1 flex flex-col justify-center">
        <div className="container px-4 mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto">
            Conectamos <span className="text-primary">Fabricantes</span> e{' '}
            <span className="text-primary">Lojistas</span> de Moda
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            A maior plataforma B2B de moda do Brasil. Encontre as melhores marcas, negocie
            diretamente e impulsione suas vendas com a V Moda.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" asChild className="text-base h-14 px-8 w-full sm:w-auto">
              <Link to="/cadastro">
                Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base h-14 px-8 w-full sm:w-auto bg-background"
            >
              <Link to="/colecoes">Explorar Coleções</Link>
            </Button>
          </div>
        </div>
        {/* Background decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Por que escolher a V Moda?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Tudo que você precisa para escalar seu negócio de moda B2B de forma segura e eficiente
              em um único ecossistema.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-muted/50 border border-border/50 text-center hover:border-primary/20 hover:bg-muted transition-colors duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Conexão Direta</h3>
              <p className="text-muted-foreground">
                Fale diretamente com os melhores fabricantes e marcas do mercado atacadista sem
                intermediários.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-muted/50 border border-border/50 text-center hover:border-primary/20 hover:bg-muted transition-colors duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Compra Segura</h3>
              <p className="text-muted-foreground">
                Garantia de entrega e qualidade. Um ambiente confiável e seguro para todas as suas
                transações B2B.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-muted/50 border border-border/50 text-center hover:border-primary/20 hover:bg-muted transition-colors duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Impulsione Vendas</h3>
              <p className="text-muted-foreground">
                Tenha acesso rápido às últimas tendências e garanta coleções exclusivas em primeira
                mão para o seu público.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Categorias em Destaque</h2>
              <p className="text-muted-foreground">Encontre o estilo perfeito para o seu estoque</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link to="/colecoes">
                Ver todas as categorias <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Moda Feminina',
                img: 'https://img.usecurling.com/p/400/600?q=womens%20fashion%20clothing',
                path: '/colecoes?categoria=moda_feminina',
              },
              {
                title: 'Jeans',
                img: 'https://img.usecurling.com/p/400/600?q=denim%20jeans%20fashion',
                path: '/colecoes?categoria=jeans',
              },
              {
                title: 'Moda Fitness',
                img: 'https://img.usecurling.com/p/400/600?q=fitness%20activewear',
                path: '/colecoes?categoria=moda_fitness',
              },
              {
                title: 'Plus Size',
                img: 'https://img.usecurling.com/p/400/600?q=curvy%20fashion',
                path: '/colecoes?categoria=plus_size',
              },
            ].map((cat, i) => (
              <Link
                key={i}
                to={cat.path}
                className="group relative rounded-xl overflow-hidden aspect-[3/4] bg-muted block"
              >
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                  <h3 className="text-white font-semibold text-xl tracking-tight">{cat.title}</h3>
                </div>
              </Link>
            ))}
          </div>

          <Button variant="outline" asChild className="w-full mt-8 sm:hidden h-12">
            <Link to="/colecoes">
              Ver todas as categorias <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto max-w-4xl text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-8 opacity-90" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Pronto para transformar sua loja?
          </h2>
          <p className="text-xl mb-10 text-primary-foreground/80 max-w-2xl mx-auto">
            Junte-se a milhares de lojistas e fabricantes que já estão revolucionando o mercado de
            moda atacadista no Brasil.
          </p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="text-lg h-14 px-10 text-primary hover:bg-secondary/90"
          >
            <Link to="/cadastro">Criar Conta Gratuitamente</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
