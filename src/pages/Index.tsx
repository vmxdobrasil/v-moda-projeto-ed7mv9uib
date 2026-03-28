import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { FadeIn } from '@/components/FadeIn'
import { ProductCard } from '@/components/ProductCard'
import { PRODUCTS } from '@/lib/data'

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
  const trendingProducts = PRODUCTS.filter((p) => p.trending).slice(0, 4)

  return (
    <div className="w-full pb-24">
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
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
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
                      Explorar Agora
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

      {/* Trending Section */}
      <section className="py-24 md:py-32 container">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-4">Looks do Momento</h2>
              <p className="text-muted-foreground max-w-md">
                As peças mais desejadas da nossa curadoria atual, selecionadas para inspirar.
              </p>
            </div>
            <Link
              to="/colecoes"
              className="group flex items-center gap-2 text-sm uppercase tracking-widest font-medium border-b border-primary pb-1 hover:text-accent hover:border-accent transition-colors"
            >
              Ver Todos{' '}
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
                    alt={category.name}
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

      {/* Editorial Section */}
      <section className="py-24 md:py-32 container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <FadeIn className="relative aspect-[4/5] lg:aspect-auto lg:h-[800px] overflow-hidden">
            <img
              src="https://img.usecurling.com/p/800/1000?q=fashion%20editorial%20minimalist%20architecture"
              alt="Editorial Inspiration"
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
    </div>
  )
}
