import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Package,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

export default function DashboardHub() {
  const stats = [
    {
      label: 'Total de Clientes',
      value: '1.248',
      icon: Users,
      change: '+12% este mês',
      positive: true,
    },
    { label: 'Projetos Ativos', value: '45', icon: Package, change: '+4 novos', positive: true },
    {
      label: 'Taxa de Conversão',
      value: '18,2%',
      icon: TrendingUp,
      change: '+2,1% este mês',
      positive: true,
    },
    {
      label: 'Mensagens Pendentes',
      value: '12',
      icon: MessageSquare,
      change: '-5 desde ontem',
      positive: false,
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Visão geral do seu negócio e métricas principais.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs flex items-center mt-1 ${stat.positive ? 'text-emerald-500' : 'text-rose-500'}`}
              >
                {stat.positive ? (
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                )}
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Resumo das conversões dos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] flex flex-col items-center justify-center bg-muted/10 rounded-md border border-dashed border-border/60 m-6 mt-0">
            <TrendingUp className="h-8 w-8 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm font-medium">Analytics Pendente</p>
            <p className="text-muted-foreground/70 text-xs mt-1 text-center max-w-[250px]">
              O gráfico de atividades será renderizado aqui assim que os dados forem consolidados.
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/50 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Últimos Leads</CardTitle>
            <CardDescription>Novos contatos capturados no WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6">
              {[
                { id: 1, name: 'Maria Silva', phone: '+55 11 99999-1234', time: 'Há 15 min' },
                { id: 2, name: 'João Santos', phone: '+55 11 98888-5678', time: 'Há 2h' },
                { id: 3, name: 'Ana Oliveira', phone: '+55 21 97777-9012', time: 'Há 5h' },
                { id: 4, name: 'Carlos Ferreira', phone: '+55 31 96666-3456', time: 'Há 1 dia' },
                { id: 5, name: 'Juliana Costa', phone: '+55 41 95555-7890', time: 'Há 1 dia' },
              ].map((lead) => (
                <div key={lead.id} className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {lead.name.charAt(0)}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold truncate">{lead.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{lead.phone}</span>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap font-medium bg-muted px-2 py-1 rounded-md">
                    {lead.time}
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
