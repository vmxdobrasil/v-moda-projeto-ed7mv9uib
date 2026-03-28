import { FadeIn } from '@/components/FadeIn'

export default function AboutUs() {
  return (
    <div className="pt-32 pb-24">
      <div className="container max-w-5xl">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-serif text-center mb-8">Sobre Nós</h1>
          <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto leading-relaxed">
            A V Moda nasceu do desejo de redefinir o conceito de elegância contemporânea. Nossa
            jornada começou com uma visão simples: criar peças atemporais que celebram a
            individualidade e a força de quem as veste.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
          <FadeIn delay={100} className="order-2 md:order-1">
            <h2 className="text-3xl font-serif mb-6">Nossa História</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Fundada em 2010 por visionários apaixonados por alta costura, a V Moda começou como
                um pequeno ateliê focado em alfaiataria sob medida no coração de São Paulo. Com o
                passar dos anos, nossa dedicação implacável à qualidade e aos detalhes nos
                transformou em uma referência de luxo acessível no mercado nacional.
              </p>
              <p>
                Acreditamos que a verdadeira elegância reside na simplicidade e no conforto. Por
                isso, cada coleção é um testemunho de nosso compromisso com a excelência, misturando
                técnicas tradicionais de alfaiataria com design inovador e modelagens que abraçam a
                diversidade de corpos.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={200} className="order-1 md:order-2">
            <div className="aspect-[4/5] bg-muted overflow-hidden relative group">
              <img
                src="https://img.usecurling.com/p/800/1000?q=fashion%20atelier%20sewing%20machine"
                alt="Nosso Ateliê"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={300}>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div className="p-8 bg-secondary/30 transition-colors hover:bg-secondary/50">
              <h3 className="text-2xl font-serif mb-4">Missão</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Empoderar pessoas através da moda, oferecendo roupas de qualidade excepcional que
                inspiram confiança e expressam autenticidade em cada detalhe do dia a dia.
              </p>
            </div>
            <div className="p-8 bg-secondary/30 transition-colors hover:bg-secondary/50">
              <h3 className="text-2xl font-serif mb-4">Visão</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ser reconhecida globalmente como a principal marca de moda que une sofisticação
                atemporal, inovação sustentável e um design impecável focado no cliente.
              </p>
            </div>
            <div className="p-8 bg-secondary/30 transition-colors hover:bg-secondary/50">
              <h3 className="text-2xl font-serif mb-4">Valores</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Excelência artesanal, sustentabilidade consciente, integridade, inclusão e paixão
                irrefreável por cada etapa do nosso processo criativo.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
