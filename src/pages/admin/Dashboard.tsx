import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingBag, Users, CreditCard, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'

const salesData = [
  { month: 'Jan', sales: 4000 },
  { month: 'Fev', sales: 3000 },
  { month: 'Mar', sales: 5000 },
  { month: 'Abr', sales: 4500 },
  { month: 'Mai', sales: 6000 },
  { month: 'Jun', sales: 5500 },
]

const topProducts = [
  { name: 'Vestido Seda', sales: 120 },
  { name: 'Blazer Alfai', sales: 98 },
  { name: 'Calça Pantal', sales: 86 },
  { name: 'Camisa Linho', sales: 75 },
  { name: 'Saia Midi', sales: 64 },
]

const lowStockProducts = [
  { id: 'PROD-004', name: 'Camisa Linho', stock: 3 },
  { id: 'PROD-007', name: 'Bolsa Couro Estruturada', stock: 1 },
  { id: 'PROD-008', name: 'Cinto Couro', stock: 4 },
]

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Visão Geral</h2>
        <p className="text-muted-foreground mt-1">Bem-vindo ao painel administrativo da V Moda.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231,89</div>
            <p className="text-xs text-muted-foreground mt-1">+20.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2.350</div>
            <p className="text-xs text-muted-foreground mt-1">+180 novos pedidos hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1.234</div>
            <p className="text-xs text-muted-foreground mt-1">+19% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 573,00</div>
            <p className="text-xs text-muted-foreground mt-1">+7% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Vendas por Período</CardTitle>
          </CardHeader>
          <CardContent className="pl-0 sm:pl-2">
            <ChartContainer
              config={{ sales: { label: 'Vendas', color: 'hsl(var(--primary))' } }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--color-sales)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ sales: { label: 'Unidades', color: 'hsl(var(--primary))' } }}
                className="h-[140px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts}
                    layout="vertical"
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.5} />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      width={90}
                      fontSize={11}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="sales"
                      fill="var(--color-sales)"
                      radius={[0, 4, 4, 0]}
                      barSize={16}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="flex-1 border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Alertas de Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border-b border-destructive/10 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm leading-none mb-1.5">
                        {product.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{product.id}</span>
                    </div>
                    <Badge variant="destructive" className="font-mono text-xs px-2">
                      {product.stock} un
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
