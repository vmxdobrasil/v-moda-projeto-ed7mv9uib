import { useState, useEffect, useMemo } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign, Target, Users, TrendingUp, Activity } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { subDays, isAfter, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRealtime } from '@/hooks/use-realtime'

export default function Reports() {
  const [referrals, setReferrals] = useState<any[]>([])
  const [period, setPeriod] = useState('30')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const refs = await pb
        .collection('referrals')
        .getFullList({ sort: '-created', expand: 'affiliate' })
      setReferrals(refs)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('referrals', () => loadData())
  useRealtime('customers', () => loadData())

  const metrics = useMemo(() => {
    const timeLimit = subDays(new Date(), parseInt(period))
    const validRefs = referrals.filter((r) => isAfter(parseISO(r.created), timeLimit))

    let affLeads = 0,
      affConv = 0,
      affPaid = 0,
      affToPay = 0
    let agLeads = 0,
      agConv = 0,
      agPaid = 0,
      agToPay = 0
    const TICKET = 500

    validRefs.forEach((r) => {
      const role = r.expand?.affiliate?.role
      const rate = r.expand?.affiliate?.commission_rate || (role === 'affiliate' ? 2 : 1)
      const comm = TICKET * (rate / 100)

      if (role === 'affiliate') {
        if (r.type === 'lead') affLeads++
        if (r.type === 'conversion') {
          affConv++
          r.is_paid ? (affPaid += comm) : (affToPay += comm)
        }
      } else if (role === 'agent') {
        if (r.type === 'lead') agLeads++
        if (r.type === 'conversion') {
          agConv++
          r.is_paid ? (agPaid += comm) : (agToPay += comm)
        }
      }
    })

    const chartMap: Record<string, any> = {}
    validRefs
      .filter((r) => r.type === 'conversion')
      .forEach((r) => {
        const m = format(parseISO(r.created), 'MMM/yy', { locale: ptBR })
        if (!chartMap[m]) chartMap[m] = { month: m, affiliate: 0, agent: 0 }
        if (r.expand?.affiliate?.role === 'affiliate') chartMap[m].affiliate++
        if (r.expand?.affiliate?.role === 'agent') chartMap[m].agent++
      })

    return {
      aff: { leads: affLeads, conv: affConv, paid: affPaid, toPay: affToPay },
      ag: { leads: agLeads, conv: agConv, paid: agPaid, toPay: agToPay },
      global: {
        leads: affLeads + agLeads,
        conv: affConv + agConv,
        paid: affPaid + agPaid,
        toPay: affToPay + agToPay,
      },
      chartData: Object.values(chartMap).reverse(),
    }
  }, [period, referrals])

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  const pieData = [
    { name: 'Afiliados', value: metrics.aff.conv, fill: 'hsl(var(--chart-1))' },
    { name: 'Agentes', value: metrics.ag.conv, fill: 'hsl(var(--chart-2))' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance e ROI</h2>
          <p className="text-muted-foreground">
            Análise segmentada do impacto financeiro de parceiros.
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Mensal (Últimos 30 dias)</SelectItem>
            <SelectItem value="90">Trimestral (Últimos 90 dias)</SelectItem>
            <SelectItem value="180">Semestral (Últimos 180 dias)</SelectItem>
            <SelectItem value="365">Anual (Últimos 365 dias)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.global.leads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Conversões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.global.conv}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {metrics.global.paid.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Total a Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              R$ {metrics.global.toPay.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle>ROI - Afiliados (Fixos 2%)</CardTitle>
            <CardDescription>Retorno sobre vendas geradas por influenciadores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Vendas Geradas (Est.)</span>
              <span className="font-bold">R$ {(metrics.aff.conv * 500).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Custo de Comissões</span>
              <span className="font-bold text-red-500">
                R$ {(metrics.aff.paid + metrics.aff.toPay).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span>Taxa de Conversão</span>
              <span className="font-bold">
                {metrics.aff.leads ? Math.round((metrics.aff.conv / metrics.aff.leads) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary">
          <CardHeader>
            <CardTitle>ROI - Agentes (Variáveis)</CardTitle>
            <CardDescription>
              Retorno sobre vendas geradas por consultores credenciados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Vendas Geradas (Est.)</span>
              <span className="font-bold">R$ {(metrics.ag.conv * 500).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Custo de Comissões</span>
              <span className="font-bold text-red-500">
                R$ {(metrics.ag.paid + metrics.ag.toPay).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span>Taxa de Conversão</span>
              <span className="font-bold">
                {metrics.ag.leads ? Math.round((metrics.ag.conv / metrics.ag.leads) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Histórico de Conversões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                affiliate: { label: 'Afiliados', color: 'hsl(var(--chart-1))' },
                agent: { label: 'Agentes', color: 'hsl(var(--chart-2))' },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="affiliate" fill="var(--color-affiliate)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="agent" fill="var(--color-agent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Participação no Funil</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ value: { label: 'Conversões' } }}
              className="h-[300px] w-full"
            >
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
