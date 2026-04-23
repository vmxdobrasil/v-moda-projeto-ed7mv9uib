import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, TrendingUp, MessageSquare } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export default function DashboardHub() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    customers: 0,
    projects: 0,
    messages: 0,
    recentCustomers: [] as any[],
  })

  const isAdmin = user?.email === 'valterpmendonca@gmail.com' || user?.role === 'admin'

  const loadStats = async () => {
    if (!user) return
    try {
      const customersFilter = !isAdmin
        ? `manufacturer = "${user.id}" || affiliate_referrer = "${user.id}"`
        : ''
      const projectsFilter = !isAdmin ? `manufacturer = "${user.id}"` : ''

      const [customersList, projectsList, messagesList] = await Promise.all([
        pb.collection('customers').getList(1, 5, { filter: customersFilter, sort: '-created' }),
        pb.collection('projects').getList(1, 1, { filter: projectsFilter }),
        pb.collection('messages').getList(1, 1, { filter: '' }),
      ])

      setStats({
        customers: customersList.totalItems,
        projects: projectsList.totalItems,
        messages: messagesList.totalItems,
        recentCustomers: customersList.items,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  useEffect(() => {
    loadStats()
  }, [user])

  useRealtime('customers', () => loadStats())
  useRealtime('projects', () => loadStats())
  useRealtime('messages', () => loadStats())

  const chartData = [
    { name: 'Jan', total: 12 },
    { name: 'Fev', total: 18 },
    { name: 'Mar', total: 24 },
    { name: 'Abr', total: 32 },
    { name: 'Mai', total: stats.customers || 45 },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {user?.name || user?.email?.split('@')[0]}! Aqui está o resumo da sua
          conta.
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
            <p className="text-xs text-muted-foreground">Clientes cadastrados na base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects}</div>
            <p className="text-xs text-muted-foreground">Produtos ativos no catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messages}</div>
            <p className="text-xs text-muted-foreground">Interações multicanal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% em relação ao mês passado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Crescimento de Clientes</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{ total: { label: 'Clientes', color: 'hsl(var(--primary))' } }}
              className="h-[300px] w-full"
            >
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Clientes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {stats.recentCustomers.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Nenhum cliente recente.
                </div>
              ) : (
                stats.recentCustomers.map((customer: any) => (
                  <div key={customer.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.email || customer.phone || 'Sem contato'}
                      </p>
                    </div>
                    <div className="ml-auto font-medium capitalize text-sm">
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
