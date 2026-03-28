import { FadeIn } from '@/components/FadeIn'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export default function FAQ() {
  const faqs = [
    {
      question: 'Quais são as opções de frete e prazos de entrega?',
      answer:
        'Oferecemos frete padrão e expresso para todo o Brasil. O prazo de entrega varia de 3 a 10 dias úteis para frete padrão, e 1 a 3 dias úteis para expresso. Para a cidade de São Paulo, também temos a opção de entrega no mesmo dia. Compras acima de R$ 1.500 têm frete padrão gratuito.',
    },
    {
      question: 'Como funciona a política de trocas e devoluções?',
      answer:
        'Sua satisfação é nossa prioridade. Você pode solicitar a troca ou devolução gratuita em até 30 dias corridos após o recebimento do pedido, desde que a peça não apresente sinais de uso, não tenha sido lavada e esteja com todas as etiquetas e lacres originais intactos.',
    },
    {
      question: 'Quais formas de pagamento são aceitas?',
      answer:
        'Aceitamos cartões de crédito das principais bandeiras (Visa, Mastercard, American Express) com parcelamento em até 10x sem juros. Também aceitamos PIX com 5% de desconto automático no valor total da compra.',
    },
    {
      question: 'Como faço para acompanhar o status do meu pedido?',
      answer:
        'Assim que seu pedido for faturado e despachado, você receberá um e-mail com a nota fiscal e o código de rastreio contendo um link para acompanhar a entrega em tempo real. Você também pode verificar todas as atualizações acessando a seção "Meus Pedidos" em sua conta.',
    },
    {
      question: 'Os produtos têm garantia?',
      answer:
        'Sim, todos os nossos produtos possuem garantia legal de 90 dias contra quaisquer defeitos de fabricação. Nossa equipe de controle de qualidade é rigorosa, mas caso identifique algum problema, nossa central de atendimento estará pronta para resolver prontamente.',
    },
    {
      question: 'Vocês possuem loja física?',
      answer:
        'Atualmente a V Moda opera com seu ateliê fechado em São Paulo para produção e algumas vendas exclusivas com hora marcada. Nossa principal operação de vendas é online, o que nos permite atender clientes de todo o Brasil com o mesmo padrão de excelência.',
    },
  ]

  return (
    <div className="pt-32 pb-24">
      <div className="container max-w-3xl">
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif mb-6">Perguntas Frequentes</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Encontre respostas rápidas para as dúvidas mais comuns sobre nossas políticas de
              compra, envios, trocas e garantias.
            </p>
          </div>

          <div className="bg-secondary/10 p-2 sm:p-6 rounded-2xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-border px-4 sm:px-6"
                >
                  <AccordionTrigger className="text-left font-serif text-lg py-6 hover:no-underline hover:text-accent transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
