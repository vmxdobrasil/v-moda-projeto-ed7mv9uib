import { Building2, Store, Clock, CheckCircle2, Wallet } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditoModaForm } from '@/components/CreditoModaForm'

export default function CreditoModa() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      {/* Hero Section */}
      <section className="container mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4 text-primary uppercase animate-fade-in-up">
          CréditoModa
        </h1>
        <p
          className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          Linhas de crédito exclusivas para impulsionar o seu negócio no ecossistema da moda.
          Financie seu estoque ou ciclo de produção com taxas competitivas.
        </p>
      </section>

      {/* Hub UI - Cards */}
      <section className="container mb-24">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card
            className="border-border shadow-sm hover:shadow-md transition-shadow animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-serif text-2xl uppercase tracking-wide">
                Crédito para Estoque
              </CardTitle>
              <CardDescription className="text-base mt-2">Ideal para Revendedoras</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p className="mb-4">
                Garanta o estoque das novas coleções e pague parcelado. Aumente suas vendas sem
                comprometer seu capital de giro.
              </p>
              <ul className="text-sm space-y-2 text-left w-fit mx-auto">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> Até R$ 50.000 de limite
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> Prazos de até 12x
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> Aprovação rápida
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card
            className="border-border shadow-sm hover:shadow-md transition-shadow animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-serif text-2xl uppercase tracking-wide">
                Crédito para Produção
              </CardTitle>
              <CardDescription className="text-base mt-2">Ideal para Fabricantes</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p className="mb-4">
                Invista em matéria-prima, maquinário ou marketing para expandir sua capacidade
                produtiva e alcançar novos mercados.
              </p>
              <ul className="text-sm space-y-2 text-left w-fit mx-auto">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> Até R$ 500.000 de limite
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> Prazos de até 36x
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> Taxas subsidiadas
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-secondary/30 py-16 mb-24">
        <div className="container">
          <h2 className="text-3xl font-serif text-center uppercase tracking-wide mb-12">
            Como Funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-xl font-bold font-serif text-primary">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Solicitação</h3>
              <p className="text-muted-foreground text-sm">
                Preencha o formulário abaixo com seus dados pessoais e da sua empresa.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-primary">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Análise</h3>
              <p className="text-muted-foreground text-sm">
                Nossa equipe avaliará seu perfil de crédito em até 48 horas úteis.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-accent">
                <Wallet className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Liberação</h3>
              <p className="text-muted-foreground text-sm">
                Após aprovação, o valor é liberado diretamente para uso na plataforma ou em conta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="container">
        <div className="max-w-2xl mx-auto bg-white p-8 border border-border shadow-sm">
          <h2 className="text-2xl font-serif text-center uppercase tracking-wide mb-2">
            Solicite sua Análise
          </h2>
          <p className="text-center text-muted-foreground mb-8 text-sm">
            Preencha os dados e dê o primeiro passo para o crescimento do seu negócio.
          </p>
          <CreditoModaForm />
        </div>
      </section>
    </div>
  )
}
