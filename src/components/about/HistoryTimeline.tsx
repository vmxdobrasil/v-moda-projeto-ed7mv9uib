import { FadeIn } from '@/components/FadeIn'
import { Circle } from 'lucide-react'

const timeline = [
  {
    year: 'Anos 90',
    title: 'Fundação',
    description: 'Fundação da Revista MODA & Cia em Goiânia por Valter Mendonça.',
  },
  {
    year: 'Expansão',
    title: 'Incorporação',
    description: 'Incorporação da MODA & Cia pela Abril Cultural.',
  },
  {
    year: 'Expertise',
    title: 'Liderança',
    description: '25 anos de atuação como Diretor de Marketing em grandes marcas nacionais.',
  },
  {
    year: 'Transformação Digital',
    title: 'Revista Digital',
    description: 'Lançamento da Revista Moda Atual Digital em parceria com Fábia Mendonça.',
  },
  {
    year: 'Hoje',
    title: 'HUB V MODA',
    description: 'Lançamento do HUB V MODA - Tecnologia e Inovação para o Mercado da Moda.',
  },
]

export function HistoryTimeline() {
  return (
    <div className="bg-secondary/30 py-24 mb-24">
      <div className="container max-w-4xl">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Nossa História</h2>
            <p className="text-muted-foreground text-lg">
              Uma jornada de inovação no mercado da moda.
            </p>
          </div>
        </FadeIn>
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-0 md:before:left-1/2 md:before:-translate-x-1/2 before:h-full before:w-0.5 before:bg-border">
          {timeline.map((item, i) => (
            <FadeIn
              key={i}
              delay={i * 100}
              className="relative flex items-center md:justify-between w-full"
            >
              {/* Circle */}
              <div className="absolute left-0 md:left-1/2 flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shrink-0 shadow z-10 md:-translate-x-1/2">
                <Circle className="w-3 h-3 fill-current" />
              </div>

              {/* Card */}
              <div
                className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-lg border bg-background shadow-sm transition-all hover:shadow-md ml-auto ${
                  i % 2 === 0 ? 'md:ml-0 md:mr-auto' : 'md:ml-auto md:mr-0'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-primary">{item.year}</span>
                </div>
                <h3 className="font-serif text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  )
}
