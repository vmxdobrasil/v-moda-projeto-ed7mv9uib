import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Users, Package, TrendingUp, Activity, Loader2 } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'

export default function Index() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeProducts: 0,
    conversionRate: 0,
    recentActivity: 0,
  })
  const [recentCustomers, setRecentCustomers] = useState<RecordModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return

      try {
        const [customersRes, productsRes, recentRes, convertedRes] = await Promise.all([
          pb.collection('customers').getList(1, 1),
          pb.collection('projects').getList(1, 1),
          pb.collection('customers').getList(1, 4, { sort: '-created' }),
          pb.collection('customers').getList(1, 1, { filter: 'status = "converted"' }),
        ])

        const conversionRate =
          customersRes.totalItems > 0
            ? Math.round((convertedRes.totalItems / customersRes.totalItems) * 100)
            : 0

        setStats({
          totalCustomers: customersRes.totalItems,
          activeProducts: productsRes.totalItems,
          conversionRate,
          recentActivity: recentRes.items.length,
        })
        setRecentCustomers(recentRes.items)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const chartData = [
    { name: 'Jan', total: Math.floor(Math.random() * 50) + 10 },
    { name: 'Fev', total: Math.floor(Math.random() * 50) + 10 },
    { name: 'Mar', total: Math.floor(Math.random() * 50) + 10 },
    { name: 'Abr', total: Math.floor(Math.random() * 50) + 10 },
    { name: 'Mai', total: Math.floor(Math.random() * 50) + 10 },
    { name: 'Jun', total: Math.floor(Math.random() * 50) + 10 },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 animate-fade-in-up">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Cadastrados na base</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProducts}</div>
            <p className="text-xs text-muted-foreground">Em catálogo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Clientes convertidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividade Recente</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">Últimos contatos adicionados</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>Acompanhe o crescimento da sua rede de contatos.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px] w-full mt-4">
              <ChartContainer
                config={{
                  customers: {
                    label: 'Clientes',
                    color: 'hsl(var(--primary))',
                  },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
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
                    <Bar dataKey="total" fill="var(--color-customers)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Contatos Recentes</CardTitle>
            <CardDescription>Últimos leads que interagiram.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentCustomers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum cliente recente.
                </p>
              ) : (
                recentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.email || customer.phone || 'Sem contato'}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-primary text-xs capitalize px-2 py-1 bg-primary/10 rounded-full">
                      {customer.status || 'novo'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
