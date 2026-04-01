import { FadeIn } from '@/components/FadeIn'
import { Sparkles, Cpu, ShieldCheck, Heart, Factory, ShoppingBag, Network } from 'lucide-react'
import { FoundersMessage } from '@/components/about/FoundersMessage'
import { HistoryTimeline } from '@/components/about/HistoryTimeline'
import { Testimonials } from '@/components/about/Testimonials'
import { FaqSection } from '@/components/about/FaqSection'

export default function AboutUs() {
  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <div className="container max-w-6xl mb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn className="order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
              Redefinindo o Conceito de Elegância
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              A V MODA é uma plataforma inovadora que nasceu do desejo de redefinir o conceito de
              elegância contemporânea. Nossa jornada começou com uma visão simples: criar uma
              plataforma que unisse informações de moda, tendências, dicas e conhecimento para todo
              o ecossistema do setor.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Desde o fabricante de roupas até os consumidores finais, proporcionamos novas
              experiências de consumo aliadas à mais moderna tecnologia e inteligência artificial
              para facilitar o seu dia a dia.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Buscamos promover elegância, confiança e autoestima, celebrando a individualidade de
              se vestir com conforto e modernidade.
            </p>
          </FadeIn>
          <FadeIn delay={200} className="order-1 lg:order-2">
            <div className="aspect-square lg:aspect-[4/5] bg-muted overflow-hidden relative group">
              <img
                src="https://img.usecurling.com/p/800/1000?q=high%20fashion%20modern%20atelier"
                alt="V MODA"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Pillars Section */}
      <div className="bg-secondary/30 py-24 mb-24">
        <div className="container max-w-6xl">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-serif mb-4">Nossos Pilares</h2>
              <p className="text-muted-foreground text-lg">
                Os valores fundamentais que guiam nossa plataforma e comunidade.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background p-8 text-center border shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-serif mb-4">Elegância</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Promovemos um estilo atemporal e contemporâneo, ajudando cada indivíduo a
                  encontrar sua melhor versão.
                </p>
              </div>
              <div className="bg-background p-8 text-center border shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-serif mb-4">Confiança</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Construímos relações sólidas e transparentes em toda a cadeia de valor,
                  fortalecendo a autoestima de nossos clientes.
                </p>
              </div>
              <div className="bg-background p-8 text-center border shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-serif mb-4">Individualidade</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Celebramos a diversidade, oferecendo conforto e modernidade para que você possa
                  expressar quem realmente é.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Ecosystem Section */}
      <div className="container max-w-6xl mb-24">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">O Ecossistema V MODA</h2>
            <p className="text-muted-foreground text-lg">
              Conectamos toda a cadeia produtiva da moda, gerando valor de ponta a ponta.
            </p>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <FadeIn delay={100}>
            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="shrink-0 mt-1">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Factory className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Para o Fabricante</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Nossa plataforma oferece canais de distribuição otimizados e maior visibilidade
                    de marca. Conectamos sua produção diretamente a revendedores e consumidores,
                    fortalecendo suas vendas e permitindo foco na qualidade.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="shrink-0 mt-1">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Para o Consumidor</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Encontre estilo e conveniência em um só lugar. Tenha acesso às últimas
                    tendências, dicas de moda personalizadas e uma curadoria exclusiva de peças que
                    unem conforto e modernidade.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="aspect-video bg-muted overflow-hidden relative">
              <img
                src="https://img.usecurling.com/p/800/600?q=fashion%20supply%20chain%20logistics"
                alt="Ecossistema de Moda"
                className="w-full h-full object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Innovation & AI */}
      <div className="bg-primary text-primary-foreground py-24 mb-24">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div className="aspect-square lg:aspect-video bg-primary-foreground/10 overflow-hidden">
                <img
                  src="https://img.usecurling.com/p/800/600?q=artificial%20intelligence%20app%20interface"
                  alt="Tecnologia e IA"
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                />
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <Cpu className="w-12 h-12 mb-6 text-accent" />
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Inovação e Inteligência Artificial
              </h2>
              <p className="text-primary-foreground/80 text-lg leading-relaxed mb-6">
                A tecnologia é o coração da nossa operação. Utilizamos as mais avançadas ferramentas
                de Inteligência Artificial para entender seu estilo, prever tendências e facilitar
                suas escolhas de moda diárias.
              </p>
              <p className="text-primary-foreground/80 text-lg leading-relaxed">
                Nossos algoritmos conectam fabricantes e consumidores de forma inteligente,
                recomendando as peças perfeitas para cada biotipo e ocasião, criando uma jornada de
                consumo verdadeiramente inovadora e personalizada.
              </p>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Founder's Message */}
      <FoundersMessage />

      {/* History Timeline */}
      <HistoryTimeline />

      {/* Partner Network Spotlight */}
      <div className="container max-w-6xl text-center mb-24">
        <FadeIn>
          <Network className="w-12 h-12 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-3xl font-serif mb-4">Nossa Rede de Parceiros</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            Trabalhamos em conjunto com os melhores fabricantes e marcas que compartilham da nossa
            visão de qualidade e excelência.
          </p>
        </FadeIn>
        <FadeIn delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-video bg-secondary/50 flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-300 rounded-sm"
              >
                <img
                  src={`https://img.usecurling.com/i?q=fashion%20brand%20logo&color=black&shape=outline&seed=${i}`}
                  alt={`Parceiro ${i}`}
                  className="max-h-12 object-contain"
                />
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FaqSection />
    </div>
  )
}
