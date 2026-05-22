import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShoppingBag, ShieldCheck, CreditCard, TrendingUp, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useSEO } from '@/hooks/useSEO'

export default function Index() {
  useSEO({
    title: 'V MODA BRASIL | O Maior Hub de Moda Atacadista',
    description:
      'Conectamos fabricantes do Polo da 44 a revendedores de todo o Brasil com crédito exclusivo, logística inteligente e gestão completa.',
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">V MODA</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a
              href="#solucoes"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Soluções
            </a>
            <a href="#v-club" className="text-sm font-medium hover:text-primary transition-colors">
              V Club Card
            </a>
            <a
              href="#parceiros"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Parceiros
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">
          <div
            className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5"
            style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}
          ></div>
          <div className="container relative z-10 text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground animate-fade-in-down">
              A Revolução do <span className="text-primary">Atacado de Moda</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground animate-fade-in-up delay-100">
              Conectamos lojistas do Polo da 44 a revendedores com gestão de logística, crédito
              integrado (Embedded Finance) e split de comissões em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200 pt-4">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8" asChild>
                <Link to="/login">
                  Acessar Plataforma <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8">
                Falar com Consultor
              </Button>
            </div>
          </div>
        </section>

        <section id="solucoes" className="py-24 bg-muted/50">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Soluções para o seu Negócio
              </h2>
              <p className="text-muted-foreground text-lg">
                Um ecossistema completo para escalar suas vendas, gerenciar representantes e
                fidelizar clientes através de integrações financeiras profundas via Asaas.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background p-8 rounded-2xl shadow-sm border">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Gestão de Leads</h3>
                <p className="text-muted-foreground">
                  Funil de vendas integrado com WhatsApp e Instagram, automatizando o primeiro
                  contato e organizando seus revendedores no CRM.
                </p>
              </div>
              <div className="bg-background p-8 rounded-2xl shadow-sm border">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Logística Inteligente</h3>
                <p className="text-muted-foreground">
                  Controle de caravanas, excursões e transportadoras. Rastreio automatizado para
                  diminuir atritos operacionais e garantir as entregas.
                </p>
              </div>
              <div className="bg-background p-8 rounded-2xl shadow-sm border">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Split de Comissões (Asaas)</h3>
                <p className="text-muted-foreground">
                  Comissionamento automático em tempo real para influenciadores, guias de compra e
                  plataforma. Transações divididas na origem garantem transparência.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="v-club" className="py-24">
          <div className="container">
            <div className="bg-slate-900 rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl">
              <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
                <Badge
                  variant="outline"
                  className="text-white border-white/20 w-fit mb-6 text-sm py-1"
                >
                  Embedded Finance
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  V Club Card <br />{' '}
                  <span className="text-blue-400 text-2xl md:text-4xl">
                    Private Label de Crédito
                  </span>
                </h2>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  Ofereça limite de crédito exclusivo para seus melhores clientes. Aumente o ticket
                  médio da sua loja com o nosso cartão 100% digital, cashback integrado e split de
                  comissões via sub-contas Asaas. (BIN 636943)
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-slate-200">
                    <CreditCard className="text-blue-400 h-5 w-5" /> Pagamento com QR Code Dinâmico
                  </li>
                  <li className="flex items-center gap-3 text-slate-200">
                    <ShieldCheck className="text-blue-400 h-5 w-5" /> Webhooks e Atualização em
                    Tempo Real
                  </li>
                  <li className="flex items-center gap-3 text-slate-200">
                    <TrendingUp className="text-blue-400 h-5 w-5" /> Retenção Máxima via Cashback
                  </li>
                </ul>
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-fit px-8"
                  asChild
                >
                  <Link to="/login">Quero Homologar Minha Loja</Link>
                </Button>
              </div>
              <div className="lg:w-1/2 bg-slate-800 p-12 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
                <div className="relative w-full max-w-md aspect-[1.58] bg-gradient-to-br from-slate-100 to-slate-300 rounded-2xl shadow-2xl p-8 flex flex-col justify-between transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex justify-between items-start">
                    <span className="text-2xl font-bold text-slate-800">V CLUB</span>
                    <span className="text-xs uppercase font-bold text-slate-500 tracking-widest">
                      Private Label
                    </span>
                  </div>
                  <div>
                    <p className="font-mono text-xl tracking-widest text-slate-700 mb-2">
                      6369 43** **** ****
                    </p>
                    <div className="flex justify-between items-end">
                      <span className="font-medium text-slate-800">CLIENTE VIP</span>
                      <span className="font-mono text-sm text-slate-600">12/28</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t py-12 text-center md:text-left">
        <div className="container grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">V MODA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A revolução do polo atacadista do Brasil.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Plataforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/login" className="hover:text-primary">
                  Login Fabricante
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary">
                  Login Revendedor
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary">
                  Painel Afiliado
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Integração Asaas
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Polo da 44, Goiânia - GO</li>
              <li>suporte@vmodabrasil.com.br</li>
              <li>(62) 99999-9999</li>
            </ul>
          </div>
        </div>
        <div className="container mt-12 pt-8 border-t text-sm text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} V Moda Brasil. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
