import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, ShoppingBag, ShieldCheck } from 'lucide-react'

export default function Index() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="relative flex-1 flex flex-col justify-center items-center text-center px-4 py-24 md:py-32 overflow-hidden bg-muted/30">
        <div className="absolute inset-0 w-full h-full bg-[url('https://img.usecurling.com/p/1200/800?q=fashion%20models')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide uppercase mb-4 inline-block">
            V Moda Oficial
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground">
            O Futuro do Mercado de Moda Atacadista
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Conectamos os melhores fabricantes aos lojistas e revendedores de todo o Brasil,
            facilitando negócios com inteligência e escala.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="text-lg h-14 px-8" asChild>
              <Link to="/cadastro">
                Começar Agora <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-14 px-8" asChild>
              <Link to="/colecoes">Ver Coleções</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher a V Moda?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Nossa plataforma oferece ferramentas exclusivas para você gerenciar, comprar e escalar
              seu negócio de moda.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-2xl bg-muted/50">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Catálogo Exclusivo</h3>
              <p className="text-muted-foreground">
                Acesse as últimas tendências e coleções dos principais polos de moda do país
                diretamente do seu painel.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-2xl bg-muted/50">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Crescimento Acelerado</h3>
              <p className="text-muted-foreground">
                Com nossa automação de vendas e relatórios em tempo real, você escala suas operações
                com eficiência.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-2xl bg-muted/50">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Negociação Segura</h3>
              <p className="text-muted-foreground">
                Realize vídeo chamadas, acompanhe histórico de conversões e gerencie todos os
                contatos num ambiente seguro.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
