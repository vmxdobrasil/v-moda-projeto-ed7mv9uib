import { FadeIn } from '@/components/FadeIn'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'O que é o HUB V MODA?',
    answer:
      'É uma plataforma que integra tecnologia, marketing e inteligência artificial para conectar fabricantes e consumidores finais.',
  },
  {
    question: 'Como a tecnologia auxilia as vendas?',
    answer:
      'Utilizamos ferramentas de inteligência artificial e estratégias de branding para otimizar a visibilidade dos produtos e facilitar o processo de compra e venda.',
  },
  {
    question: 'Qual o papel da Revista Moda Atual?',
    answer:
      'A revista provê o conhecimento, tendências e a base editorial que alimenta a curadoria e as estratégias do ecossistema V MODA.',
  },
]

export function FaqSection() {
  return (
    <div className="container max-w-3xl mb-24">
      <FadeIn>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Perguntas Frequentes</h2>
          <p className="text-muted-foreground text-lg">
            Tire suas dúvidas sobre o ecossistema V MODA.
          </p>
        </div>
      </FadeIn>
      <FadeIn delay={200}>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-medium text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </FadeIn>
    </div>
  )
}
