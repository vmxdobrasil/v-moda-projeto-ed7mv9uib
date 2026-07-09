import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
} from 'recharts'
import {
  Users,
  DollarSign,
  ShoppingCart,
  Store,
  TrendingUp,
  Activity,
  Package,
  Award,
} from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { AdminMasterTools } from '@/components/admin/AdminMasterTools'

export default function AdminMaster() {
  const [orders, setOrders] = useState<any[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [manufacturerCount, setManufacturerCount] = useState(0)
  const [retailerCount, setRetailerCount] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [ord, cust, prods, mfrs, rets] = await Promise.all([
        pb
          .collection('orders')
          .getFullList({ sort: '-created' })
          .catch(() => []),
        pb
          .collection('customers')
          .getList(1, 1)
          .catch(() => ({ totalItems: 0 })),
        pb
          .collection('projects')
          .getList(1, 1)
          .catch(() => ({ totalItems: 0 })),
        pb
          .collection('users')
          .getList(1, 1, { filter: 'role = "manufacturer"' })
          .catch(() => ({ totalItems: 0 })),
        pb
          .collection('users')
          .getList(1, 1, { filter: 'role = "retailer"' })
          .catch(() => ({ totalItems: 0 })),
      ])
      setOrders(ord)
      setCustomerCount((cust as any).totalItems || 0)
      setProductCount((prods as any).totalItems || 0)
      setManufacturerCount((mfrs as any).totalItems || 0)
      setRetailerCount((rets as any).totalItems || 0)
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

  const ecosystemData = useMemo(
    () => [
      { name: 'Fabricantes', value: manufacturerCount, color: 'hsl(24, 100%, 50%)' },
      { name: 'Lojistas', value: retailerCount, color: 'hsl(210, 100%, 12.5%)' },
      { name: 'Clientes', value: customerCount, color: 'hsl(215, 85%, 45%)' },
    ],
    [manufacturerCount, retailerCount, customerCount],
  )

  const salesConfig: ChartConfig = {
    vendas: { label: 'Vendas (R$)', color: 'hsl(24, 100%, 50%)' },
  }
  const ecosystemConfig: ChartConfig = {
    value: { label: 'Total', color: 'hsl(210, 100%, 12.5%)' },
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
    { label: 'Fabricantes', value: manufacturerCount, icon: Store, color: 'text-navy' },
    { label: 'Lojistas', value: retailerCount, icon: Users, color: 'text-azul' },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up p-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-navy dark:text-white">
            Painel Master — Vmx do Brasil
          </h1>
          <p className="text-muted-foreground mt-2">
            Visão macro do ecossistema V MODA BRASIL — Administradora de Cartões e Benefícios Ltda.
          </p>
        </div>
        <Link to="/admin/dashboard">
          <Button variant="outline" size="sm">
            Voltar ao Painel
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Carregando painel master...</div>
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
                    <CardTitle className="text-sm font-medium font-display">{s.label}</CardTitle>
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
                <CardTitle className="font-display">Distribuição do Ecossistema</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={ecosystemConfig} className="h-[240px] w-full">
                  <PieChart>
                    <Pie
                      data={ecosystemData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry: any) => `${entry.name}: ${entry.value}`}
                    >
                      {ecosystemData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl shadow-soft border-primary/10">
            <CardHeader>
              <CardTitle className="font-display">Resumo do Ecossistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
                  <Package className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Produtos Cadastrados</p>
                  <p className="text-xl font-bold font-display">{productCount}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
                  <ShoppingCart className="w-5 h-5 text-electric mb-2" />
                  <p className="text-sm text-muted-foreground">Pedidos Totais</p>
                  <p className="text-xl font-bold font-display">{orders.length}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
                  <TrendingUp className="w-5 h-5 text-emerald mb-2" />
                  <p className="text-sm text-muted-foreground">Pagos</p>
                  <p className="text-xl font-bold font-display text-emerald">
                    {orders.filter((o) => o.status === 'paid').length}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
                  <Activity className="w-5 h-5 text-electric mb-2" />
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-xl font-bold font-display text-electric">{pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <AdminMasterTools />
        </>
      )}
    </div>
  )
}
