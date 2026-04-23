import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Target, ShoppingBag, CheckCircle2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useAuth } from '@/hooks/use-auth'

const chartData = [
  { month: 'Jan', leads: 150, conversoes: 45 },
  { month: 'Fev', leads: 230, conversoes: 80 },
  { month: 'Mar', leads: 180, conversoes: 65 },
  { month: 'Abr', leads: 290, conversoes: 110 },
  { month: 'Mai', leads: 320, conversoes: 140 },
  { month: 'Jun', leads: 280, conversoes: 125 },
]

const chartConfig = {
  leads: {
    label: 'Leads',
    color: 'hsl(var(--primary))',
  },
  conversoes: {
    label: 'Conversões',
    color: 'hsl(var(--chart-2, 160 60% 45%))',
  },
}

export default function DashboardHub() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalLeads: 0,
    converted: 0,
    conversionRate: 0,
    totalProducts: 0,
    loading: true,
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const [leadsReq, convertedReq, productsReq] = await Promise.all([
          pb.collection('customers').getList(1, 1),
          pb.collection('customers').getList(1, 1, { filter: "status='converted'" }),
          pb.collection('projects').getList(1, 1),
        ])

        const totalLeads = leadsReq.totalItems
        const converted = convertedReq.totalItems
        const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0

        setStats({
          totalLeads,
          converted,
          conversionRate,
          totalProducts: productsReq.totalItems,
          loading: false,
        })
      } catch (error) {
        console.error('Failed to load stats', error)
        setStats((s) => ({ ...s, loading: false }))
      }
    }
    loadStats()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo de volta, {user?.name || 'Usuário'}. Aqui está o resumo do seu negócio.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
                <p className="text-xs text-muted-foreground mt-1">Contatos registrados na base</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.converted}</div>
                <p className="text-xs text-muted-foreground mt-1">Leads que realizaram compra</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.conversionRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">Eficiência de fechamento</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">Itens no catálogo</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle>Evolução de Leads e Conversões</CardTitle>
            <CardDescription>
              Desempenho dos últimos 6 meses (Dados simulados para demonstração)
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 20,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-leads)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-leads)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillConversoes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-conversoes)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-conversoes)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-xs text-muted-foreground"
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="var(--color-leads)"
                    fill="url(#fillLeads)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="conversoes"
                    stroke="var(--color-conversoes)"
                    fill="url(#fillConversoes)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
