import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Store, Users, DollarSign, Activity, FileText, Calculator, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    manufacturers: 0,
    leads: 0,
    gmv: 0,
    pending: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          pb.collection('users').getList(1, 1, { filter: 'role="manufacturer"' }),
          pb.collection('customers').getList(1, 1, { filter: 'status!="inactive"' }),
        ])
        setStats({
          manufacturers: mRes.totalItems,
          leads: cRes.totalItems,
          gmv: 1250000, // Mock for visual presentation of volumetry
          pending: 14, // Mock for pending conciliations
        })
      } catch (err) {
        console.error(err)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-8 animate-fade-in-up max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Estratégica</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe as métricas do ecossistema e oportunidades de crescimento.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="gap-2 bg-background">
            <Link to="/admin/partnerships/zoop">
              <FileText className="w-4 h-4" />
              Gerar Proposta Zoop (PDF)
            </Link>
          </Button>
          <Button className="gap-2">
            <Calculator className="w-4 h-4" />
            Simulador de Split
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Fabricantes Totais</CardTitle>
            <Store className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.manufacturers}</div>
            <p className="text-xs text-muted-foreground mt-1">Lojistas atacadistas mapeados</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Leads Ativos</CardTitle>
            <Users className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leads}</div>
            <p className="text-xs text-muted-foreground mt-1">Revendedores em negociação</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-violet-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Volume Global (GMV)</CardTitle>
            <DollarSign className="w-4 h-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                maximumFractionDigits: 0,
              }).format(stats.gmv)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimativa de transações no ecossistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Conciliações Pendentes</CardTitle>
            <Activity className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando integração com Zoop</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Próximos Passos (Build-Up)</CardTitle>
            <CardDescription>Ações estratégicas pendentes para o ecossistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-3 border rounded-lg bg-muted/30">
              <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold">Pitch Executivo Zoop</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Gerar o documento oficial da proposta de parceria de Embedded Finance.
                </p>
              </div>
              <Button size="sm" variant="ghost" asChild>
                <Link to="/admin/partnerships/zoop">
                  Ver <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="flex items-start gap-4 p-3 border rounded-lg">
              <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                <Calculator className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold">Configuração de Split de Pagamento</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Definir o Take Rate de fabricantes e afiliados nas configurações globais.
                </p>
              </div>
              <Button size="sm" variant="ghost" disabled>
                Em Breve
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-slate-900 text-slate-50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100 text-lg">Inovação B2B Financeira</CardTitle>
            <CardDescription className="text-slate-400">
              O diferencial da plataforma ao operar com split em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              O ecossistema V MODA não apenas conecta compradores a fabricantes, mas revoluciona a
              liquidez do Polo da 44 por meio da <strong>Conciliação Bancária Automatizada</strong>.
              O uso do Embedded Finance permitirá o destravamento do "CréditoModa" e a distribuição
              imediata de comissões, gerando escalabilidade sem atrito operacional.
            </p>
            <Button className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200" asChild>
              <Link to="/admin/partnerships/zoop">Acessar Detalhes da Proposta</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
