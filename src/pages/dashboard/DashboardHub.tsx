import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, TrendingUp, DollarSign } from 'lucide-react'

export default function DashboardHub() {
  const stats = [
    { title: 'Total de Leads', value: '1,248', icon: Users, trend: '+12% este mês' },
    { title: 'Projetos Ativos', value: '45', icon: Package, trend: '+4 novos' },
    { title: 'Taxa de Conversão', value: '18.2%', icon: TrendingUp, trend: '+2.1% este mês' },
    { title: 'Receita Estimada', value: 'R$ 45.231', icon: DollarSign, trend: '+8% este mês' },
  ]

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Visão geral do desempenho e métricas do negócio.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Novo lead capturado</p>
                    <p className="text-sm text-muted-foreground">Via campanha de WhatsApp</p>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">Há {i * 2}h</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Projetos em Destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={`https://img.usecurling.com/p/100/100?q=fashion&seed=${i}`}
                      alt="Projeto de Moda"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Coleção Verão {i}</p>
                    <p className="text-sm text-muted-foreground">Em produção</p>
                  </div>
                  <div className="text-sm font-medium">9{i}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
