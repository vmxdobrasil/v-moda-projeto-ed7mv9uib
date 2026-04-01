import { FadeIn } from '@/components/FadeIn'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Juliana Costa',
    role: 'Fabricante',
    quote:
      'A V MODA transformou a maneira como distribuímos nossos produtos, conectando-nos diretamente aos parceiros certos com muita agilidade.',
    seed: 'juliana',
  },
  {
    name: 'Ricardo Alves',
    role: 'Revendedor',
    quote:
      'Encontrar marcas de qualidade e gerenciar meu estoque nunca foi tão fácil. A plataforma é intuitiva e essencial para o meu negócio.',
    seed: 'ricardo',
  },
  {
    name: 'Mariana Silva',
    role: 'Revendedora',
    quote:
      'As ferramentas de inteligência artificial me ajudam a prever tendências e oferecer exatamente o que meus clientes estão buscando.',
    seed: 'mariana',
  },
]

export function Testimonials() {
  return (
    <div className="container max-w-6xl mb-24">
      <FadeIn>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Quem caminha conosco</h2>
          <p className="text-muted-foreground text-lg">
            Histórias de sucesso de parceiros que fazem parte do nosso ecossistema.
          </p>
        </div>
      </FadeIn>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((item, i) => (
          <FadeIn key={i} delay={i * 150}>
            <Card className="h-full bg-secondary/20 border-none shadow-none relative">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10" />
              <CardContent className="pt-8 px-6 pb-6 flex flex-col h-full">
                <p className="text-muted-foreground leading-relaxed flex-grow mb-8 relative z-10">
                  "{item.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={`https://img.usecurling.com/ppl/thumbnail?gender=${
                        i === 1 ? 'male' : 'female'
                      }&seed=${item.seed}`}
                    />
                    <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
