import { Link } from 'react-router-dom'
import { Activity, CreditCard, DollarSign, Package, TrendingUp, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartData = [
  { month: 'Jan', sales: 18600, leads: 200 },
  { month: 'Fev', sales: 30500, leads: 250 },
  { month: 'Mar', sales: 23700, leads: 150 },
  { month: 'Abr', sales: 73000, leads: 450 },
  { month: 'Mai', sales: 20900, leads: 120 },
  { month: 'Jun', sales: 21400, leads: 140 },
]

const chartConfig = {
  sales: {
    label: 'Vendas',
    color: 'hsl(var(--primary))',
  },
  leads: {
    label: 'Leads',
    color: 'hsl(var(--muted-foreground))',
  },
} satisfies ChartConfig

export default function Index() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Principal</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link to="/colecoes">Ver Coleções</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Acessar Painel Interno</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231,89</div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Lojistas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2.350</div>
            <p className="text-xs text-muted-foreground">+180.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Realizados</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.234</div>
            <p className="text-xs text-muted-foreground">+19% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 desde a última hora</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Desempenho de Vendas</CardTitle>
            <CardDescription>Resumo mensal de faturamento e captação.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                <Bar dataKey="leads" fill="var(--color-leads)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Você teve 265 interações neste mês.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                {
                  name: 'Moda Fashion SP',
                  email: 'contato@modafashion.com',
                  value: '+R$ 1.999,00',
                },
                { name: 'Boutique Maria', email: 'vendas@boutiquemaria.com', value: '+R$ 390,00' },
                { name: 'Jeans Express', email: 'jeans@express.com', value: '+R$ 2.450,00' },
                { name: 'Estilo Urbano', email: 'estilo@urbano.com.br', value: '+R$ 899,00' },
                { name: 'Atacado Central', email: 'compras@atacado.com', value: '+R$ 5.600,00' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {activity.name.charAt(0)}
                  </div>
                  <div className="ml-4 space-y-1 overflow-hidden">
                    <p className="text-sm font-medium leading-none truncate">{activity.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.email}</p>
                  </div>
                  <div className="ml-auto font-medium text-sm whitespace-nowrap">
                    {activity.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start w-full" asChild>
              <Link to="/meus-pedidos">
                <Package className="mr-2 h-4 w-4" /> Meus Pedidos
              </Link>
            </Button>
            <Button variant="outline" className="justify-start w-full" asChild>
              <Link to="/painel-fabricante">
                <TrendingUp className="mr-2 h-4 w-4" /> Painel do Fabricante
              </Link>
            </Button>
            <Button variant="outline" className="justify-start w-full" asChild>
              <Link to="/afiliados">
                <Users className="mr-2 h-4 w-4" /> Área de Afiliados
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
