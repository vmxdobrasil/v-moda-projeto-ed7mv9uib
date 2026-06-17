import { Button } from '@/components/ui/button'

const Index = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://img.usecurling.com/p/1920/1080?q=fashion%20models&dpr=2"
            alt="Moda Fashion"
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight">
            V MODA BRASIL
          </h1>
          <p className="text-xl md:text-2xl font-light mb-10 max-w-2xl mx-auto">
            A essência da moda brasileira. Conectando fabricantes, revendedores e o melhor do
            estilo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-none px-8 font-semibold tracking-widest uppercase">
              Explorar Coleções
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-none px-8 font-semibold tracking-widest uppercase text-white border-white hover:bg-white hover:text-black"
            >
              Seja um Parceiro
            </Button>
          </div>
        </div>
      </section>

      {/* Collections Summary */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4">Coleções em Destaque</h2>
            <p className="text-muted-foreground">
              Descubra as tendências que estão definindo a estação
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Moda Feminina', img: 'women%20fashion' },
              { title: 'Moda Praia', img: 'beachwear%20fashion' },
              { title: 'Moda Fitness', img: 'fitness%20clothing' },
            ].map((cat, i) => (
              <div
                key={i}
                className="group cursor-pointer relative aspect-[3/4] overflow-hidden bg-muted"
              >
                <img
                  src={`https://img.usecurling.com/p/600/800?q=${cat.img}&dpr=2`}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-serif font-bold tracking-wider uppercase">
                    {cat.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Index
