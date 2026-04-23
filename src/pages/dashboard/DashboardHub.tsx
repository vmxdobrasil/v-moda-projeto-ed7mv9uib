import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Package, MessageSquare, Box, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'

export default function DashboardHub() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    customers: 0,
    projects: 0,
    newLeads: 0,
    messages: 0,
  })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      const isAdmin = user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com'
      const customerFilter = isAdmin
        ? ''
        : `manufacturer = "${user?.id}" || affiliate_referrer = "${user?.id}"`

      const newLeadsFilter = customerFilter
        ? `(${customerFilter}) && status = 'new'`
        : `status = 'new'`

      const projectFilter = isAdmin ? '' : `manufacturer = "${user?.id}"`

      const [customersRes, projectsRes, newLeadsRes, messagesRes] = await Promise.all([
        pb.collection('customers').getList(1, 1, { filter: customerFilter, $autoCancel: false }),
        pb.collection('projects').getList(1, 1, { filter: projectFilter, $autoCancel: false }),
        pb.collection('customers').getList(1, 1, { filter: newLeadsFilter, $autoCancel: false }),
        pb.collection('messages').getList(1, 1, { $autoCancel: false }),
      ])

      setStats({
        customers: customersRes.totalItems,
        projects: projectsRes.totalItems,
        newLeads: newLeadsRes.totalItems,
        messages: messagesRes.totalItems,
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadStats()
  }, [user])

  useRealtime('customers', () => loadStats())
  useRealtime('projects', () => loadStats())
  useRealtime('channels', () => loadStats())
  useRealtime('messages', () => loadStats())

  const statCards = [
    {
      title: 'Clientes Ativos',
      value: stats.customers,
      icon: Users,
      desc: 'Base total de clientes',
      link: '/customers',
    },
    {
      title: 'Produtos Ativos',
      value: stats.projects,
      icon: Package,
      desc: 'Catálogo de produtos',
      link: '/products',
    },
    {
      title: 'Novos Leads',
      value: stats.newLeads,
      icon: Users,
      desc: 'Leads aguardando contato',
      link: '/customers',
    },
    {
      title: 'Mensagens',
      value: stats.messages,
      icon: MessageSquare,
      desc: 'Interações registradas',
      link: '/messages',
    },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo de volta! Aqui está o resumo do seu negócio.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <span className="animate-pulse">...</span> : stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1 mb-3">{stat.desc}</p>
              <Link
                to={stat.link}
                className="text-xs font-medium text-primary flex items-center hover:underline"
              >
                Ver detalhes
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Últimas Atualizações</CardTitle>
            <CardDescription>Atividade recente na sua conta e status do sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Box className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Tudo pronto para operar!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Os dados do seu painel são atualizados e sincronizados em tempo real.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
