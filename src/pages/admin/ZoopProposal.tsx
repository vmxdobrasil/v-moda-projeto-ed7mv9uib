import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
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
  Copy,
  FileText,
  Check,
  Download,
  Loader2,
  type LucideIcon,
} from 'lucide-react'

declare global {
  interface Window {
    html2pdf: any
  }
}

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

const proposalText = `Proposta Estratégica para o Departamento Comercial Zoop - V MODA Brasil

O V MODA Brasil apresenta uma oportunidade massiva de mercado (atualmente em fase de pré-lançamento/desenvolvimento). Nosso ecossistema foi projetado para conectar de forma inédita mais de 16.000 fabricantes — concentrados estrategicamente no Polo de Moda de Goiânia-GO (Regiões da 44 e Fama), com expansão prevista para milhares de outros nos polos do Brás e Bom Retiro (SP) — a um público alvo de mais de 5.000.000 (5 milhões) de lojistas e revendedoras/sacoleiras em todo o país.

Proposta de Valor Central:
Atuar como o principal hub financeiro (Embedded Finance) do setor atacadista de moda. Buscamos integrar a infraestrutura de pagamentos e split da Zoop para roteamento de recebíveis na fonte, garantindo liquidação instantânea para o fabricante, comissionamento automático para a V MODA e nossa rede descentralizada de afiliados.

Prontidão Tecnológica:
Nossa plataforma é construída sobre uma stack técnica moderna e escalável (Vite, React, TypeScript, TailwindCSS no frontend) com um backend robusto (Skip Cloud / Adapta) que conta com Motor de Regras de Acesso (RLS) estrito. A arquitetura já está desenhada e pronta para a integração direta com os SDKs e APIs da Zoop, visando um go-to-market ágil e seguro.`

export default function ZoopProposal() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(proposalText)
    setCopied(true)
    toast({
      title: 'Texto copiado!',
      description: 'A proposta foi copiada para a área de transferência.',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src =
            'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      const element = document.getElementById('proposal-pdf-content')
      if (!element) throw new Error('Element not found')

      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.top = '0'
      container.style.left = '0'
      container.style.width = '800px'
      container.style.zIndex = '-9999'

      const clone = element.cloneNode(true) as HTMLElement
      clone.style.display = 'block'
      container.appendChild(clone)
      document.body.appendChild(container)

      const opt = {
        margin: [15, 0, 15, 0], // top, right, bottom, left
        filename: 'Proposta_Comercial_Zoop_VMODA.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }

      await window.html2pdf().set(opt).from(clone).save()

      document.body.removeChild(container)

      toast({
        title: 'PDF Gerado com sucesso!',
        description: 'O download foi iniciado em seu navegador.',
      })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Não foi possível processar o documento. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-12 max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-background to-primary/5 border rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
              Uso Interno - Departamento Comercial
            </Badge>
            <Badge
              variant="secondary"
              className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20"
            >
              Fase: Pré-lançamento
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            V MODA Brasil <span className="text-muted-foreground font-normal">x</span> Zoop
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Apresentação estratégica da escala, alcance e potencial de mercado do ecossistema V MODA
            para integração de infraestrutura financeira.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            className="gap-2 shadow-lg bg-blue-600 hover:bg-blue-700 text-white border-none"
            onClick={generatePDF}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {isGenerating ? 'Gerando...' : 'Gerar PDF da Proposta'}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 shadow-lg bg-background/50 backdrop-blur-sm"
              >
                <FileText className="w-5 h-5" />
                Ver Proposta Detalhada
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Proposta Comercial Zoop</DialogTitle>
                <DialogDescription>
                  Texto estratégico estruturado para envio ou apresentação à equipe comercial da
                  Zoop.
                </DialogDescription>
              </DialogHeader>
              <div className="relative mt-4">
                <div className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap font-medium font-mono text-muted-foreground border">
                  {proposalText}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2 h-8 gap-1.5 shadow-sm border"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado' : 'Copiar Texto'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Market Reach */}
        <Card className="border-t-4 border-t-blue-500 shadow-sm">
          <CardHeader>
            <Store className="w-8 h-8 text-blue-500 mb-2" />
            <CardTitle>Potencial de Mercado: Fabricantes</CardTitle>
            <CardDescription>O maior polo atacadista de moda do Brasil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/10 p-2 rounded-full mt-1 shrink-0">
                <CheckCircle className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h4 className="font-extrabold text-xl text-blue-600 dark:text-blue-400">
                  16.000 Lojas Fabricantes
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Concentração exclusiva no <strong>Polo de Moda de Goiânia-GO</strong> (Regiões da
                  44 e Fama), com potencial imediato de onboarding em massa para soluções de
                  pagamento no lançamento.
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
                  Expansão ativa e mapeamento em andamento para os polos do{' '}
                  <strong>Brás (SP)</strong>, <strong>Bom Retiro (SP)</strong> e outras regiões
                  estratégicas de confecção no Brasil.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audience Impact */}
        <Card className="border-t-4 border-t-emerald-500 shadow-sm">
          <CardHeader>
            <Users className="w-8 h-8 text-emerald-500 mb-2" />
            <CardTitle>Potencial de Mercado: Audiência (B2B)</CardTitle>
            <CardDescription>A força de vendas descentralizada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-full mt-1 shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-extrabold text-3xl text-emerald-600 dark:text-emerald-400">
                  5.000.000+
                </h4>
                <p className="font-bold text-foreground mt-1">Lojistas e Revendedoras</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Público alvo massivo (sacoleiras, lojistas e revendedores) espalhado por todas as
                  regiões do Brasil, que já compra nestes polos e revende ativamente.
                </p>
              </div>
            </div>
            <div className="p-4 bg-emerald-500/5 rounded-lg mt-2 border border-emerald-500/20">
              <p className="text-sm text-muted-foreground">
                <strong className="text-emerald-700 dark:text-emerald-400">Oportunidade:</strong>{' '}
                Uma base gigantesca e altamente engajada que demanda soluções de pagamento
                facilitado e parcelamento B2B, representando um GMV latente multimilionário.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revista Moda Atual Digital Branding */}
      <Card className="shadow-sm bg-gradient-to-br from-card to-muted/30">
        <CardHeader>
          <Activity className="w-8 h-8 text-primary mb-2" />
          <CardTitle>Tração e Motor de Aquisição</CardTitle>
          <CardDescription>
            O ecossistema multiplataforma Revista Moda Atual Digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3 items-center">
            <div className="space-y-2 text-center sm:text-left border-b sm:border-b-0 sm:border-r pb-4 sm:pb-0 sm:pr-4">
              <h3 className="text-4xl font-extrabold text-primary">315.000+</h3>
              <p className="font-bold text-lg">Seguidores Orgânicos</p>
              <p className="text-xs text-muted-foreground mt-2">
                Marco expressivo conquistado em apenas 1 ano, demonstrando alto fit de mercado e
                servindo como o principal motor de tráfego e aquisição B2B para a V MODA.
              </p>
            </div>
            <div className="sm:col-span-2 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-background text-center gap-3 shadow-sm hover:border-primary/30 transition-colors">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-bold">www.revistamodaatual.com.br</span>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-bold tracking-wider uppercase"
                >
                  Web Platform
                </Badge>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-background text-center gap-3 shadow-sm hover:border-primary/30 transition-colors">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-bold">Aplicativos Nativos</span>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge
                    variant="default"
                    className="text-[10px] font-bold tracking-wider bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700"
                  >
                    Apple App Store
                  </Badge>
                  <Badge
                    variant="default"
                    className="text-[10px] font-bold tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                  >
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
            <CardDescription>Necessidades financeiras para o lançamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <PitchFeature
              icon={Landmark}
              title="Visão Embedded Finance"
              description="Transformar o V MODA em um verdadeiro hub financeiro para o setor atacadista, oferecendo soluções de pagamento acopladas diretamente no fluxo de trabalho B2B."
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
              Maturidade da stack para integração bancária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                O ecossistema V MODA é nativamente desenvolvido sobre uma{' '}
                <strong className="text-white">arquitetura Cloud state-of-the-art</strong>, pronta
                para consumir as APIs e SDKs da Zoop:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span className="text-sm text-slate-300">
                    Frontend de altíssima performance construído com{' '}
                    <strong className="text-white">Vite, React, TypeScript e TailwindCSS</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span className="text-sm text-slate-300">
                    Backend robusto (Skip Cloud) desenhado para modelar relacionamentos complexos
                    B2B2C e gerenciar volumes transacionais escaláveis.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span className="text-sm text-slate-300">
                    Motor de Regras de Acesso (RLS) estrito integrado nativamente, garantindo
                    segurança e isolamento de dados a nível de registro financeiro.
                  </span>
                </li>
              </ul>
              <div className="pt-5 mt-4 border-t border-slate-800 flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 bg-blue-500/10"
                >
                  React / Vite / TS
                </Badge>
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
                  API / Webhooks Ready
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden PDF Content */}
      <div id="proposal-pdf-content" style={{ display: 'none' }}>
        <div className="w-[800px] p-10 bg-white text-slate-900 font-sans mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-slate-900 pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">V MODA Brasil</h1>
              <p className="text-xl text-slate-500 mt-1">Proposta Comercial Estratégica</p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 border border-slate-300 rounded text-xs uppercase tracking-widest font-bold text-slate-600">
                Confidencial
              </div>
              <p className="text-sm text-slate-500 mt-2">
                {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Disclaimer / Stage */}
          <div className="bg-slate-100 border-l-4 border-slate-800 p-5 mb-8 rounded-r-lg">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-2">
              Aviso de Fase do Projeto
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              Este documento apresenta o <strong>Potencial de Mercado</strong> e o{' '}
              <strong>Alcance Projetado</strong> do ecossistema V MODA Brasil. A plataforma
              encontra-se atualmente em fase de pré-lançamento/desenvolvimento. Os números aqui
              apresentados refletem o mercado-alvo e a base de parceiros mapeada para o
              go-to-market, não representando obrigatoriamente usuários ativos na plataforma no
              momento atual.
            </p>
          </div>

          {/* Executive Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Sumário Executivo</h2>
            <p className="text-base text-slate-700 leading-relaxed mb-4">
              O V MODA Brasil apresenta uma oportunidade massiva de mercado com o objetivo de atuar
              como o principal hub financeiro (Embedded Finance) do setor atacadista de moda.
              Buscamos integrar a infraestrutura de pagamentos e split da <strong>Zoop</strong> para
              roteamento de recebíveis na fonte, garantindo liquidação instantânea para o
              fabricante, comissionamento automático para a V MODA e nossa rede descentralizada de
              afiliados.
            </p>
          </div>

          {/* Market Potential: Manufacturers */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">
              Potencial de Mercado: Fabricantes
            </h2>
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                <p className="text-4xl font-black text-slate-900 mb-1">16.000</p>
                <p className="font-bold text-slate-800 text-lg">Lojas Fabricantes</p>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Concentração exclusiva no <strong>Polo de Moda de Goiânia-GO</strong> (Regiões da
                  44 e Fama), com potencial imediato de onboarding em massa.
                </p>
              </div>
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                <p className="text-4xl font-black text-slate-900 mb-1">Milhares</p>
                <p className="font-bold text-slate-800 text-lg">Parceiros Adicionais</p>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Expansão ativa e mapeamento em andamento para os polos do{' '}
                  <strong>Brás (SP)</strong>, <strong>Bom Retiro (SP)</strong> e outras regiões
                  estratégicas no país.
                </p>
              </div>
            </div>
          </div>

          {/* Market Potential: Resellers */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">
              Potencial de Mercado: Audiência (B2B)
            </h2>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-4 text-center">
              <p className="text-5xl font-black text-slate-900 mb-2">5.000.000+</p>
              <p className="font-bold text-slate-800 text-xl">Lojistas e Revendedoras</p>
              <p className="text-base text-slate-600 mt-3 max-w-2xl mx-auto leading-relaxed">
                Público-alvo massivo espalhado por todas as regiões do Brasil, representando um GMV
                latente multimilionário que demanda soluções de pagamento facilitado e parcelamento
                B2B.
              </p>
            </div>
          </div>

          {/* Traction */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">
              Tração e Motor de Aquisição
            </h2>
            <p className="text-base text-slate-700 leading-relaxed mb-4">
              O ecossistema é impulsionado pela <strong>Revista Moda Atual Digital</strong>, atuando
              como o principal canal de tráfego e aquisição B2B:
            </p>
            <div className="flex gap-4 mt-4">
              <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-2xl font-bold text-slate-900">315.000+</p>
                <p className="text-sm font-semibold text-slate-600">Seguidores Orgânicos</p>
              </div>
              <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-lg font-bold text-slate-900 mt-1">Plataforma Web</p>
                <p className="text-sm text-slate-600">www.revistamodaatual.com.br</p>
              </div>
              <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-lg font-bold text-slate-900 mt-1">Apps Nativos</p>
                <p className="text-sm text-slate-600">Apple Store & Google Play</p>
              </div>
            </div>
          </div>

          {/* Infrastructure */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">
              Prontidão Tecnológica
            </h2>
            <p className="text-base text-slate-700 leading-relaxed mb-4">
              A V MODA Brasil é nativamente desenvolvida sobre uma arquitetura Cloud
              state-of-the-art, pronta para consumir as APIs e SDKs da Zoop:
            </p>
            <ul className="space-y-3 text-slate-700">
              <li className="flex gap-2">
                <span className="text-slate-400">•</span>
                <span>
                  Frontend de altíssima performance construído com Vite, React, TypeScript e
                  TailwindCSS.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400">•</span>
                <span>
                  Backend robusto (Skip Cloud) desenhado para modelar relacionamentos complexos
                  B2B2C e gerenciar volumes transacionais escaláveis.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400">•</span>
                <span>
                  Motor de Regras de Acesso (RLS) estrito integrado nativamente, garantindo
                  segurança e isolamento de dados a nível de registro financeiro.
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="mt-16 pt-8 border-t-2 border-slate-100 text-center">
            <div className="inline-block bg-slate-900 text-white px-6 py-4 rounded-xl">
              <p className="text-lg font-bold">V MODA Brasil</p>
              <p className="text-sm text-slate-300 mt-1">Departamento Comercial e Parcerias</p>
              <p className="text-sm text-slate-400 mt-2 font-mono">
                contato@vmoda.com.br | www.vmoda.com.br
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
