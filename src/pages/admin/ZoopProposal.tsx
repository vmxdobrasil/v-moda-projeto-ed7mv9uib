import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Store,
  Users,
  Smartphone,
  Globe,
  ShieldCheck,
  ArrowRightLeft,
  Cpu,
  Network,
  Briefcase,
  Activity,
  TrendingUp,
  CheckCircle,
  Landmark,
  CreditCard,
  type LucideIcon,
} from 'lucide-react'

function PitchFeature({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-lg">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

export default function ZoopProposal() {
  return (
    <div className="space-y-8 animate-fade-in-up pb-12 max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-background to-primary/5 border rounded-2xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
            Uso Interno - Departamento Comercial
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            V MODA Brasil <span className="text-muted-foreground font-normal">x</span> Zoop
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Apresentação estratégica da escala, alcance e maturidade técnica do ecossistema V MODA
            para integração de infraestrutura financeira.
          </p>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Market Reach */}
        <Card className="border-t-4 border-t-blue-500 shadow-sm">
          <CardHeader>
            <Store className="w-8 h-8 text-blue-500 mb-2" />
            <CardTitle>Alcance de Mercado & Fabricantes</CardTitle>
            <CardDescription>O maior polo atacadista de moda do Brasil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/10 p-2 rounded-full mt-1 shrink-0">
                <CheckCircle className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold">16.000 Lojas Fabricantes</h4>
                <p className="text-sm text-muted-foreground">
                  Concentração somente no polo de moda de Goiânia-GO, com potencial imediato de
                  onboarding em massa para soluções de pagamento.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/10 p-2 rounded-full mt-1 shrink-0">
                <Network className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold">Milhares de Fabricantes Adicionais</h4>
                <p className="text-sm text-muted-foreground">
                  Expansão ativa e presença consolidada nos polos do Brás (SP), Bom Retiro (SP) e
                  outras regiões estratégicas do Brasil.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audience Impact */}
        <Card className="border-t-4 border-t-emerald-500 shadow-sm">
          <CardHeader>
            <Users className="w-8 h-8 text-emerald-500 mb-2" />
            <CardTitle>Impacto de Audiência (B2B)</CardTitle>
            <CardDescription>A força de vendas descentralizada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-full mt-1 shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">5 Milhões+</h4>
                <p className="text-sm text-muted-foreground">
                  De lojistas, revendedoras e sacoleiras que compram regularmente nestes polos e
                  revendem ativamente em todas as regiões do país.
                </p>
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg mt-2 border">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Oportunidade:</strong> Uma base gigantesca e
                altamente engajada que demanda soluções de pagamento facilitado e parcelamento B2B,
                representando um GMV latente multimilionário.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revista Moda Atual Digital Branding */}
      <Card className="shadow-sm bg-gradient-to-br from-card to-muted/30">
        <CardHeader>
          <Activity className="w-8 h-8 text-primary mb-2" />
          <CardTitle>Tração e Posicionamento de Marca</CardTitle>
          <CardDescription>
            O ecossistema multiplataforma Revista Moda Atual Digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3 items-center">
            <div className="space-y-2 text-center sm:text-left border-b sm:border-b-0 sm:border-r pb-4 sm:pb-0 sm:pr-4">
              <h3 className="text-4xl font-extrabold text-primary">315.000+</h3>
              <p className="font-semibold">Seguidores Orgânicos</p>
              <p className="text-xs text-muted-foreground">
                Marco conquistado demonstrando alto fit de mercado e autoridade B2B como principal
                motor de tráfego e aquisição.
              </p>
            </div>
            <div className="sm:col-span-2 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-background text-center gap-3">
                <div className="p-2 bg-muted rounded-full">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">www.revistamodaatual.com.br</span>
                <Badge variant="secondary" className="text-[10px]">
                  Web Platform
                </Badge>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-background text-center gap-3">
                <div className="p-2 bg-muted rounded-full">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">Aplicativos Nativos</span>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    Apple App Store
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    Google Play Store
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zoop Request & Tech Infrastructure */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 shadow-md">
          <CardHeader>
            <Briefcase className="w-8 h-8 text-primary mb-2" />
            <CardTitle>A Tese e Demanda para a Zoop</CardTitle>
            <CardDescription>Necessidades financeiras para escalar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <PitchFeature
              icon={Landmark}
              title="Visão Embedded Finance"
              description="Transformar o V MODA em um verdadeiro hub financeiro para o setor, oferecendo soluções de pagamento white-label acopladas diretamente no fluxo de trabalho B2B."
            />
            <PitchFeature
              icon={ArrowRightLeft}
              title="Split de Pagamentos"
              description="Roteamento inteligente de recebíveis na fonte. Liquidação instantânea para o fabricante, V MODA (take rate) e afiliados parceiros, essencial para o modelo marketplace."
            />
            <PitchFeature
              icon={ShieldCheck}
              title="Conciliação Bancária Automatizada"
              description="Fim do controle manual de boletos e TEDs. Oferecer aos lojistas um painel financeiro centralizado, reduzindo atrito logístico e operacional com baixas automáticas."
            />
            <PitchFeature
              icon={CreditCard}
              title="Potencial CréditoModa"
              description="Fornecimento de liquidez para a cadeia. Antecipação de recebíveis para fabricantes e limite de crédito facilitado para lojistas alavancarem o GMV dentro do hub."
            />
          </CardContent>
        </Card>

        <Card className="bg-slate-900 text-slate-50 border-slate-800">
          <CardHeader>
            <Cpu className="w-8 h-8 text-blue-400 mb-2" />
            <CardTitle className="text-slate-100">Prontidão Tecnológica</CardTitle>
            <CardDescription className="text-slate-400">
              Maturidade para integração bancária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                O V MODA Brasil é nativamente desenvolvido sobre a{' '}
                <strong className="text-white">infraestrutura Skip/Adapta</strong>. Esta arquitetura
                cloud provê:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span className="text-sm text-slate-300">
                    Banco de dados robusto de alta performance, desenhado para modelar
                    relacionamentos complexos B2B2C e multivendor.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span className="text-sm text-slate-300">
                    Motor de Regras de Acesso (RLS) estrito, garantindo segurança e privacidade a
                    nível de registro transacional.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span className="text-sm text-slate-300">
                    Serviços prontos para rápida integração bidirecional (APIs RESTful e Webhooks)
                    com o ecossistema Zoop.
                  </span>
                </li>
              </ul>
              <div className="pt-5 mt-4 border-t border-slate-800 flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 bg-blue-500/10"
                >
                  Skip Cloud Backend
                </Badge>
                <Badge
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 bg-blue-500/10"
                >
                  React/Vite Frontend
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
