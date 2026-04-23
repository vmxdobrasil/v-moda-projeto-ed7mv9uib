import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, MessageSquare, TrendingUp, Activity } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { useAuth } from '@/hooks/use-auth'

const chartData = [
  { month: 'Jan', leads: 40, sales: 24 },
  { month: 'Fev', leads: 30, sales: 13 },
  { month: 'Mar', leads: 20, sales: 98 },
  { month: 'Abr', leads: 27, sales: 39 },
  { month: 'Mai', leads: 18, sales: 48 },
  { month: 'Jun', leads: 23, sales: 38 },
  { month: 'Jul', leads: 34, sales: 43 },
]

const chartConfig = {
  leads: {
    label: 'Leads',
    color: 'hsl(var(--primary))',
  },
  sales: {
    label: 'Vendas',
    color: 'hsl(var(--primary) / 0.5)',
  },
}

export default function DashboardHub() {
  const { user } = useAuth()

  return (
    <div className="flex-1 space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Bem-vindo(a), {user?.name || 'Administrador'}!
        </h2>
        <p className="text-muted-foreground">Aqui está o resumo do seu negócio hoje.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2.350</div>
            <p className="text-xs text-muted-foreground">+180 no último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.234</div>
            <p className="text-xs text-muted-foreground">+19% em relação ao mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Não Lidas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">Requerem sua atenção</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% no último mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>Comparativo de Leads e Vendas nos últimos 7 meses.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
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
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="leads" fill="var(--color-leads)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas interações na plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-8">
              {[
                {
                  title: 'Novo Lead Cadastrado',
                  desc: 'João Silva via WhatsApp',
                  time: 'Agora mesmo',
                },
                { title: 'Venda Confirmada', desc: 'Projeto #4392 aprovado', time: 'Há 2 horas' },
                {
                  title: 'Nova Mensagem',
                  desc: 'Maria perguntou sobre envios',
                  time: 'Há 4 horas',
                },
                { title: 'Novo Afiliado', desc: 'Carlos se registrou', time: 'Ontem' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mr-4 shrink-0 mt-0.5">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.desc}</p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
