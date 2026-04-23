import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getCustomers, Customer } from '@/services/customers'
import { getReferrals, Referral } from '@/services/referrals'
import { useRealtime } from '@/hooks/use-realtime'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Target, TrendingUp, Users, Award, Link as LinkIcon } from 'lucide-react'

export default function Analytics() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [customersData, referralsData] = await Promise.all([getCustomers(), getReferrals()])
      setCustomers(customersData)
      setReferrals(referralsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', loadData)
  useRealtime('referrals', loadData)

  const { funnelData, conversionRate, totalLeads, convertedLeads } = useMemo(() => {
    const statuses = {
      new: { label: 'Novos', count: 0, color: 'hsl(var(--chart-1))' },
      interested: { label: 'Interessados', count: 0, color: 'hsl(var(--chart-2))' },
      negotiating: { label: 'Em Negociação', count: 0, color: 'hsl(var(--chart-3))' },
      converted: { label: 'Convertidos', count: 0, color: 'hsl(var(--chart-4))' },
    }

    let validLeadsCount = 0

    customers.forEach((c) => {
      if (c.status in statuses) {
        statuses[c.status as keyof typeof statuses].count++
        validLeadsCount++
      }
    })

    const data = [
      { name: statuses.new.label, value: statuses.new.count, fill: statuses.new.color },
      {
        name: statuses.interested.label,
        value: statuses.interested.count,
        fill: statuses.interested.color,
      },
      {
        name: statuses.negotiating.label,
        value: statuses.negotiating.count,
        fill: statuses.negotiating.color,
      },
      {
        name: statuses.converted.label,
        value: statuses.converted.count,
        fill: statuses.converted.color,
      },
    ]

    const conv =
      validLeadsCount > 0 ? Math.round((statuses.converted.count / validLeadsCount) * 100) : 0

    return {
      funnelData: data,
      conversionRate: conv,
      totalLeads: validLeadsCount,
      convertedLeads: statuses.converted.count,
    }
  }, [customers])

  const chartConfig = {
    value: { label: 'Leads', color: 'hsl(var(--primary))' },
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando métricas...</div>
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
        <p className="text-muted-foreground">
          Analise o desempenho e a conversão do seu funil de vendas em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Leads que realizaram compra</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total no Funil</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">Leads ativos no processo</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendas Concluídas</CardTitle>
            <Award className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{convertedLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">Negócios fechados</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Indicações</CardTitle>
            <LinkIcon className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{referrals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cliques, leads e conversões de afiliados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cliques de Afiliados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referrals.filter((r) => r.type === 'click').length}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads de Afiliados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referrals.filter((r) => r.type === 'lead').length}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversões de Afiliados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referrals.filter((r) => r.type === 'conversion').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
            <CardDescription>Volume de leads por etapa do processo comercial</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  fontSize={13}
                  width={100}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
