import { FadeIn } from '@/components/FadeIn'

export function FoundersMessage() {
  return (
    <div className="container max-w-6xl mb-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div className="aspect-[4/5] bg-muted overflow-hidden relative group rounded-lg">
            <img
              src="https://img.usecurling.com/ppl/large?gender=male&seed=valter"
              alt="Valter Mendonça"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale hover:grayscale-0"
            />
          </div>
        </FadeIn>
        <FadeIn delay={200}>
          <h2 className="text-3xl md:text-4xl font-serif mb-6">Mensagem do Criador</h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Com uma trajetória de mais de 25 anos moldando o cenário do marketing e da moda,
              Valter Mendonça traz para a V MODA a mesma visão disruptiva que o levou a fundar a
              emblemática revista MODA & Cia nos anos 90 em Goiânia.
            </p>
            <p>
              Após a incorporação do título pela Abril Cultural e décadas de liderança como Diretor
              de Marketing em grandes marcas, Valter uniu-se novamente à renomada editora de moda
              Fábia Mendonça para dar vida à Revista Moda Atual Digital.
            </p>
            <p>
              Hoje, essa evolução culmina no HUB de negócios V MODA: uma plataforma robusta e
              inovadora projetada para dinamizar o polo de moda de Goiás e do Brasil, integrando
              inteligência artificial, estratégias de branding e alta tecnologia para fortalecer as
              vendas de todo o ecossistema têxtil.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t">
            <p className="font-serif text-xl text-foreground">Valter Mendonça</p>
            <p className="text-sm text-muted-foreground mt-1">com Fábia Mendonça</p>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
