import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShoppingBag, Star, TrendingUp } from 'lucide-react'

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://img.usecurling.com/p/1920/1080?q=fashion%20models"
            alt="Fashion Models"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight">
            V MODA <br />
            <span className="text-3xl md:text-5xl font-light italic">
              Elegância em cada detalhe
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-light">
            Descubra as últimas tendências e coleções exclusivas. Conectando fabricantes,
            revendedores e amantes da moda em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90 rounded-none text-base uppercase tracking-widest h-14 px-8"
              asChild
            >
              <Link to="/colecoes">Ver Coleções</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 rounded-none text-base uppercase tracking-widest h-14 px-8"
              asChild
            >
              <Link to="/revenda">Seja uma Revendedora</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-background">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Nossas Categorias</h2>
            <div className="w-24 h-1 bg-primary mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Moda Feminina',
                image: 'https://img.usecurling.com/p/600/800?q=womens%20fashion',
              },
              { title: 'Moda Praia', image: 'https://img.usecurling.com/p/600/800?q=beachwear' },
              { title: 'Acessórios', image: 'https://img.usecurling.com/p/600/800?q=jewelry' },
            ].map((cat, i) => (
              <Link
                to={`/colecoes?q=${cat.title.toLowerCase()}`}
                key={i}
                className="group relative overflow-hidden aspect-[3/4] block cursor-pointer"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                  <h3 className="text-2xl font-serif text-white mb-2">{cat.title}</h3>
                  <p className="text-white/80 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    Explorar <ArrowRight className="w-4 h-4" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Marcas Exclusivas</h3>
              <p className="text-muted-foreground">
                Acesso direto aos melhores fabricantes do mercado, com produtos de alta qualidade.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Gestão de Vendas</h3>
              <p className="text-muted-foreground">
                Painel completo para acompanhar suas vendas, comissões e relacionamento com
                clientes.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Conteúdo Educativo</h3>
              <p className="text-muted-foreground">
                Revistas digitais, cursos e guias de moda para impulsionar o seu negócio.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
