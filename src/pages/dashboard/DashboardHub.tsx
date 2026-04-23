import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, MessageSquare, Factory, Settings as SettingsIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

export default function DashboardHub() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    customers: 0,
    projects: 0,
    messages: 0,
    manufacturers: 0,
  })

  useEffect(() => {
    let mounted = true

    async function loadStats() {
      try {
        const [customers, projects, messages, manufacturers] = await Promise.all([
          pb.collection('customers').getList(1, 1),
          pb.collection('projects').getList(1, 1),
          pb.collection('messages').getList(1, 1, { filter: 'status="pending"' }),
          pb.collection('users').getList(1, 1, { filter: 'role="manufacturer"' }),
        ])

        if (mounted) {
          setStats({
            customers: customers.totalItems,
            projects: projects.totalItems,
            messages: messages.totalItems,
            manufacturers: manufacturers.totalItems,
          })
        }
      } catch (err) {
        console.error('Error loading dashboard stats:', err)
      }
    }

    loadStats()

    return () => {
      mounted = false
    }
  }, [])

  const modules = [
    {
      title: 'Leads / Clientes',
      description: 'Gerencie seus clientes e leads',
      icon: Users,
      path: '/customers',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      stat: stats.customers,
      statLabel: 'Total cadastrado',
    },
    {
      title: 'Projetos',
      description: 'Catálogo e produtos',
      icon: Package,
      path: '/products',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      stat: stats.projects,
      statLabel: 'Projetos ativos',
    },
    {
      title: 'Mensagens',
      description: 'Central de atendimento',
      icon: MessageSquare,
      path: '/messages',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      stat: stats.messages,
      statLabel: 'Mensagens pendentes',
    },
    {
      title: 'Fabricantes',
      description: 'Gestão de parceiros',
      icon: Factory,
      path: '/manufacturers',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      stat: stats.manufacturers,
      statLabel: 'Fabricantes ativos',
    },
    {
      title: 'Configurações',
      description: 'Ajustes do sistema',
      icon: SettingsIcon,
      path: '/settings',
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      stat: null,
      statLabel: '',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Olá,{' '}
          <span className="font-medium text-foreground">
            {user?.name || user?.email || 'Administrador'}
          </span>
          . Selecione um módulo abaixo para começar.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <Link key={mod.path} to={mod.path} className="block group">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 relative overflow-hidden bg-card">
              <CardHeader className="pb-2">
                <div
                  className={`w-12 h-12 rounded-lg ${mod.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <mod.icon className={`w-6 h-6 ${mod.color}`} />
                </div>
                <CardTitle className="text-xl">{mod.title}</CardTitle>
                <CardDescription>{mod.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {mod.stat !== null && (
                  <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-bold tracking-tight">{mod.stat}</span>
                    <span className="text-muted-foreground text-sm ml-2 font-medium">
                      {mod.statLabel}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
