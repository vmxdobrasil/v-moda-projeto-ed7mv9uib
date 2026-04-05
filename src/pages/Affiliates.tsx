import { Link } from 'react-router-dom'
import { ArrowRight, DollarSign, BarChart, Users, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/FadeIn'

export default function Affiliates() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <section className="py-12 md:py-24 flex flex-col items-center text-center">
          <FadeIn>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
              Programa de Parcerias V Moda
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-6 max-w-4xl">
              Transforme sua influência em <span className="text-primary">resultados reais</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se ao programa de afiliados V Moda. Promova as melhores marcas de moda da região
              e seja recompensado por cada lojista que você conectar ao nosso portal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link to="/cadastro">
                  Quero ser um Afiliado <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link to="/login">Já sou afiliado</Link>
              </Button>
            </div>
          </FadeIn>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-muted/30 rounded-3xl px-6 md:px-12 mt-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Por que ser um Afiliado V Moda?</h2>
            <p className="text-muted-foreground">
              Vantagens exclusivas para parceiros do nosso ecossistema.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn delay={100}>
              <div className="bg-background p-6 rounded-2xl border shadow-sm h-full">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Comissões Atrativas</h3>
                <p className="text-muted-foreground">
                  Seja recompensado por cada lead qualificado ou conversão gerada através do seu
                  link exclusivo.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="bg-background p-6 rounded-2xl border shadow-sm h-full">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <BarChart className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Painel de Desempenho</h3>
                <p className="text-muted-foreground">
                  Acompanhe seus cliques, leads e conversões em tempo real em um dashboard completo
                  e intuitivo.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={300}>
              <div className="bg-background p-6 rounded-2xl border shadow-sm h-full">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Marcas Verificadas</h3>
                <p className="text-muted-foreground">
                  Indique com segurança. Nosso portal conta com os melhores fabricantes atacadistas
                  do mercado.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold">Como Funciona</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {[
              {
                title: 'Cadastre-se no Programa',
                desc: 'Crie sua conta como afiliado de forma rápida e gratuita.',
              },
              {
                title: 'Gere seus Links',
                desc: 'Acesse seu painel para gerar links exclusivos do portal ou de marcas específicas.',
              },
              {
                title: 'Compartilhe e Indique',
                desc: 'Divulgue seus links nas suas redes sociais, grupos de WhatsApp ou site.',
              },
              {
                title: 'Acompanhe os Resultados',
                desc: 'Monitore os lojistas que acessaram as marcas através da sua indicação.',
              },
            ].map((step, idx) => (
              <FadeIn key={idx} delay={idx * 100}>
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">{step.title}</h4>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
