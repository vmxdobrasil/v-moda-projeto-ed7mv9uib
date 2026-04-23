import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, MessageSquare, TrendingUp, Activity } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const chartData = [
  { month: 'Jan', leads: 120 },
  { month: 'Fev', leads: 180 },
  { month: 'Mar', leads: 250 },
  { month: 'Abr', leads: 210 },
  { month: 'Mai', leads: 320 },
  { month: 'Jun', leads: 450 },
]

const chartConfig = {
  leads: {
    label: 'Novos Leads',
    color: 'hsl(var(--primary))',
  },
}

const recentLeads = [
  { id: 1, name: 'Juliana Costa', store: 'Boutique JC', status: 'Novo', date: 'Há 2 horas' },
  {
    id: 2,
    name: 'Roberto Almeida',
    store: 'Moda & Cia',
    status: 'Em Negociação',
    date: 'Há 4 horas',
  },
  { id: 3, name: 'Fernanda Lima', store: 'Estilo F', status: 'Convertido', date: 'Ontem' },
  { id: 4, name: 'Carlos Santos', store: 'CS Vestuário', status: 'Novo', date: 'Ontem' },
  { id: 5, name: 'Aline Ferreira', store: 'Aline Modas', status: 'Novo', date: 'Ontem' },
]

export default function DashboardHub() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe o desempenho do seu negócio e seus leads recentes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.254</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-emerald-500 font-medium flex items-center mr-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15%
              </span>
              <span>em relação ao mês anterior</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-emerald-500 font-medium flex items-center mr-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +4
              </span>
              <span>novos projetos esta semana</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Pendentes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground mt-1">Requerem sua atenção hoje</p>
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
              <span className="text-emerald-500 font-medium flex items-center mr-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.1%
              </span>
              <span>nos últimos 30 dias</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Crescimento de Leads</CardTitle>
            <CardDescription>Volume de novos contatos gerados nos últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={chartConfig} className="h-full min-h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  className="text-muted-foreground text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  className="text-muted-foreground text-xs"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="leads" fill="var(--color-leads)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Leads Recentes</CardTitle>
            <CardDescription>Últimos contatos registrados na plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {lead.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{lead.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[180px]">
                      {lead.store}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge
                      variant={
                        lead.status === 'Convertido'
                          ? 'default'
                          : lead.status === 'Em Negociação'
                            ? 'secondary'
                            : 'outline'
                      }
                      className="text-[10px] font-medium"
                    >
                      {lead.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {lead.date}
                    </span>
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
