import { useState, useEffect, useMemo } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Users, DollarSign, ShoppingCart, MapPin, Activity } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { CRMLeadGrid } from '@/components/crm/CRMLeadGrid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [agentCount, setAgentCount] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [ord, cust, prods] = await Promise.all([
        pb.collection('orders').getFullList({ sort: '-created' }),
        pb.collection('customers').getList(1, 1),
        pb.collection('projects').getList(1, 1),
      ])
      setOrders(ord)
      setCustomerCount(cust.totalItems)
      setProductCount(prods.totalItems)
      try {
        const ag = await pb.collection('users').getList(1, 1, { filter: 'role = "agent"' })
        setAgentCount(ag.totalItems)
      } catch {
        /* ignore */
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('orders', loadData)
  useRealtime('customers', loadData)

  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((s, o) => s + (o.total_amount || 0), 0)
  const pendingOrders = orders.filter((o) => o.status === 'pending').length

  const salesData = useMemo(() => {
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    const today = new Date()
    return labels.map((day, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (6 - i))
      const dayOrders = orders.filter(
        (o) => new Date(o.created).toDateString() === date.toDateString(),
      )
      return { day, vendas: dayOrders.reduce((s, o) => s + (o.total_amount || 0), 0) }
    })
  }, [orders])

  const growthData = useMemo(() => {
    const labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
    const today = new Date()
    return labels.map((week, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (21 - i * 7))
      return { week, clientes: Math.max(1, Math.round(customerCount * ((i + 1) / 4))) }
    })
  }, [customerCount])

  const salesConfig: ChartConfig = {
    vendas: { label: 'Vendas (R$)', color: 'hsl(24, 100%, 50%)' },
  }
  const growthConfig: ChartConfig = {
    clientes: { label: 'Clientes', color: 'hsl(210, 100%, 12.5%)' },
  }

  const stats = [
    {
      label: 'Receita Total',
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      label: 'Pedidos Pendentes',
      value: pendingOrders,
      icon: ShoppingCart,
      color: 'text-electric',
    },
    { label: 'Clientes', value: customerCount, icon: Users, color: 'text-navy' },
    { label: 'Agentes Ativos', value: agentCount, icon: MapPin, color: 'text-emerald' },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up p-2">
      <Tabs defaultValue="leads" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-background shadow-sm border border-border/50">
            <TabsTrigger
              value="leads"
              className="data-[state=active]:text-primary data-[state=active]:bg-primary/10"
            >
              <Users className="w-4 h-4 mr-2" />
              Meus Clientes e Leads
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className="data-[state=active]:text-primary data-[state=active]:bg-primary/10"
            >
              <Activity className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="leads" className="mt-0 space-y-6">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight font-display text-navy dark:text-white">
                  Meus Clientes e Leads
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gerencie contatos, acompanhe o histórico e envie mensagens via WhatsApp.
                </p>
              </div>
              <div className="text-sm font-medium text-muted-foreground bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border">
                Total Leads: {customerCount}
              </div>
            </div>
          </div>
          <CRMLeadGrid adminView={true} />
        </TabsContent>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-display text-navy dark:text-white">
              Painel de Gestão Master
            </h1>
            <p className="text-muted-foreground mt-2">
              Visão geral em tempo real do ecossistema V MODA BRASIL.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando painel...</div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => {
                  const Icon = s.icon
                  return (
                    <Card
                      key={s.label}
                      className="rounded-2xl shadow-soft hover-depth border-primary/10"
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-display">
                          {s.label}
                        </CardTitle>
                        <Icon className={`h-5 w-5 ${s.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold font-display">{s.value}</div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-2xl shadow-soft border-primary/10">
                  <CardHeader>
                    <CardTitle className="font-display">Vendas (Últimos 7 dias)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={salesConfig} className="h-[240px] w-full">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Bar dataKey="vendas" fill="hsl(24, 100%, 50%)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-soft border-primary/10">
                  <CardHeader>
                    <CardTitle className="font-display">Crescimento de Clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={growthConfig} className="h-[240px] w-full">
                      <LineChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="week" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Line
                          type="monotone"
                          dataKey="clientes"
                          stroke="hsl(210, 100%, 12.5%)"
                          strokeWidth={3}
                          dot={{ r: 5 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl shadow-soft border-primary/10">
                <CardHeader>
                  <CardTitle className="font-display">Resumo do Catálogo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
                      <p className="text-sm text-muted-foreground">Produtos</p>
                      <p className="text-xl font-bold font-display">{productCount}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
                      <p className="text-sm text-muted-foreground">Pedidos Totais</p>
                      <p className="text-xl font-bold font-display">{orders.length}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
                      <p className="text-sm text-muted-foreground">Pagos</p>
                      <p className="text-xl font-bold font-display text-emerald">
                        {orders.filter((o) => o.status === 'paid').length}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                      <p className="text-xl font-bold font-display text-electric">
                        {pendingOrders}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
