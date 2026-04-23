import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Package, TrendingUp, Activity, ArrowUpRight } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'

export default function DashboardHub() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    customers: 0,
    projects: 0,
    newLeads: 0,
  })
  const [recentCustomers, setRecentCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const [customersData, projectsData, recentLeadsData] = await Promise.all([
          pb.collection('customers').getList(1, 1),
          pb.collection('projects').getList(1, 1),
          pb.collection('customers').getList(1, 5, {
            sort: '-created',
          }),
        ])

        if (isMounted) {
          setStats({
            customers: customersData.totalItems,
            projects: projectsData.totalItems,
            newLeads: recentLeadsData.items.filter((c) => c.status === 'new').length,
          })
          setRecentCustomers(recentLeadsData.items)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (user) {
      loadData()
    }

    return () => {
      isMounted = false
    }
  }, [user])

  const chartData = [
    { name: 'Jan', total: 12 },
    { name: 'Fev', total: 18 },
    { name: 'Mar', total: 24 },
    { name: 'Abr', total: 19 },
    { name: 'Mai', total: 32 },
    { name: 'Jun', total: 45 },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Bem-vindo de volta! Aqui está o resumo do seu negócio.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-500" />
              <span className="text-emerald-500 font-medium">+12%</span>&nbsp;em relação ao mês
              passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newLeads}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-500" />
              <span className="text-emerald-500 font-medium">+4%</span>&nbsp;em relação ao mês
              passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects}</div>
            <p className="text-xs text-muted-foreground mt-1">Projetos cadastrados no sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-500" />
              <span className="text-emerald-500 font-medium">+2.4%</span>&nbsp;em relação ao mês
              passado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Crescimento (Leads)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                total: {
                  label: 'Leads',
                  color: 'hsl(var(--primary))',
                },
              }}
              className="h-[350px] w-full"
            >
              <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Últimos Cadastros</CardTitle>
            <CardDescription>Leads e clientes mais recentes no sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCustomers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum cadastro recente encontrado.
              </div>
            ) : (
              <div className="space-y-6">
                {recentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm shrink-0">
                      {customer.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{customer.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {customer.email || customer.phone || 'Sem contato'}
                      </p>
                    </div>
                    <Badge
                      variant={customer.status === 'new' ? 'default' : 'secondary'}
                      className="capitalize shrink-0"
                    >
                      {customer.status || 'novo'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
