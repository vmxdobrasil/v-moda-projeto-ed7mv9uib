import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Users,
  Package,
  MessageSquare,
  Bell,
  TrendingUp,
  UserCheck,
  Clock,
  ChevronRight,
  Globe,
  Play,
  Apple,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { MonthlySales } from '@/components/dashboard/MonthlySales'

export default function DashboardHub() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    customers: 0,
    converted: 0,
    negotiating: 0,
    projects: 0,
    pendingMessages: 0,
  })
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        const isAdmin = user.role === 'admin' || user.email === 'valterpmendonca@gmail.com'
        const customerFilter = isAdmin
          ? ''
          : `manufacturer = "${user.id}" || affiliate_referrer = "${user.id}"`
        const projectFilter = isAdmin ? '' : `manufacturer = "${user.id}"`

        const [
          customersRes,
          convertedRes,
          negotiatingRes,
          projectsRes,
          messagesRes,
          notificationsRes,
        ] = await Promise.all([
          pb.collection('customers').getList(1, 1, { filter: customerFilter }),
          pb.collection('customers').getList(1, 1, {
            filter: customerFilter
              ? `(${customerFilter}) && status = 'converted'`
              : `status = 'converted'`,
          }),
          pb.collection('customers').getList(1, 1, {
            filter: customerFilter
              ? `(${customerFilter}) && status = 'negotiating'`
              : `status = 'negotiating'`,
          }),
          pb.collection('projects').getList(1, 1, { filter: projectFilter }),
          pb.collection('messages').getList(1, 1, { filter: `status = 'pending'` }),
          pb.collection('notifications').getList(1, 5, {
            filter: `user = "${user.id}" || customer_email = "${user.email}"`,
            sort: '-created',
          }),
        ])

        setStats({
          customers: customersRes.totalItems,
          converted: convertedRes.totalItems,
          negotiating: negotiatingRes.totalItems,
          projects: projectsRes.totalItems,
          pendingMessages: messagesRes.totalItems,
        })
        setNotifications(notificationsRes.items)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const statCards = [
    {
      title: 'Total de Clientes',
      value: stats.customers,
      icon: Users,
      description: 'Leads e clientes cadastrados',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Em Negociação',
      value: stats.negotiating,
      icon: Clock,
      description: 'Clientes em atendimento',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      title: 'Convertidos',
      value: stats.converted,
      icon: UserCheck,
      description: 'Vendas realizadas',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Projetos Ativos',
      value: stats.projects,
      icon: Package,
      description: 'Produtos no catálogo',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Mensagens Pendentes',
      value: stats.pendingMessages,
      icon: MessageSquare,
      description: 'Aguardando resposta',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Olá, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Aqui está o resumo das suas atividades e métricas de hoje.
        </p>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 border border-primary/20 shadow-sm flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold tracking-tight flex items-center gap-2">
            Revista Moda Atual
          </h2>
          <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
            Acesse o portal oficial para notícias e tendências em tempo real, ou baixe o aplicativo
            para ter o melhor da moda sempre com você.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <Button asChild variant="default" className="flex-1 sm:flex-none">
            <a
              href="https://www.revistamodaatual.com.br"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visitar site da Revista Moda Atual"
            >
              <Globe className="w-4 h-4 mr-2" />
              Site Oficial
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 sm:flex-none bg-background/50 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/50 transition-colors"
          >
            <a
              href="https://play.google.com/store/search?q=revista+moda+atual"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Baixar aplicativo da Revista Moda Atual no Google Play"
            >
              <Play className="w-4 h-4 mr-2" />
              Google Play
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 sm:flex-none bg-background/50 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/50 transition-colors"
          >
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Baixar aplicativo da Revista Moda Atual na App Store"
            >
              <Apple className="w-4 h-4 mr-2" />
              App Store
            </a>
          </Button>
        </div>
      </div>

      <MonthlySales />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-3 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {statCards.map((stat, index) => (
            <Card key={index} className="transition-all hover:shadow-md border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={cn('p-2 rounded-full', stat.bg)}>
                  <stat.icon className={cn('h-4 w-4', stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full lg:col-span-2 border-border/50 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Acesso Rápido
            </CardTitle>
            <CardDescription>Links para as principais áreas do sistema</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 flex-1">
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 justify-start hover:border-primary/50 hover:bg-primary/5 group"
            >
              <Link to="/customers" className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 w-full">
                  <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-base">Gerenciar Clientes</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-normal text-left">
                  Visualize e atualize o status dos seus leads.
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 justify-start hover:border-primary/50 hover:bg-primary/5 group"
            >
              <Link to="/products" className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 w-full">
                  <Package className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-base">Meus Projetos</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-normal text-left">
                  Cadastre novos produtos e acompanhe o estoque.
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 justify-start hover:border-primary/50 hover:bg-primary/5 group"
            >
              <Link to="/messages" className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 w-full">
                  <MessageSquare className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-base">Mensagens</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-normal text-left">
                  Responda clientes e interaja via WhatsApp.
                </span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-1 border-border/50 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações Recentes
            </CardTitle>
            <CardDescription>Suas últimas atualizações</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {loading ? (
              <div className="space-y-4 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-2 w-2 mt-2 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-4 flex-1">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 group">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-primary/10 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium leading-tight truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground/70">
                        {format(new Date(notification.created), "dd 'de' MMMM, HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium">Nenhuma notificação</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Você está em dia com seus avisos.
                </p>
              </div>
            )}
            <div className="mt-auto pt-4 border-t shrink-0">
              <Button
                variant="ghost"
                className="w-full text-xs text-primary hover:text-primary/80"
                asChild
              >
                <Link to="/settings">
                  Ver todas as notificações
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
