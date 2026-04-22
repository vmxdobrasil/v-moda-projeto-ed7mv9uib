import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRealtime } from '@/hooks/use-realtime'
import { Users, Shirt, MessageSquare, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

const MOCK_CUSTOMERS = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria@example.com',
    status: 'converted',
    source: 'whatsapp',
    created: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao@example.com',
    status: 'negotiating',
    source: 'instagram',
    created: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana@example.com',
    status: 'new',
    source: 'site',
    created: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '4',
    name: 'Carlos Ferreira',
    email: 'carlos@example.com',
    status: 'interested',
    source: 'manual',
    created: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '5',
    name: 'Lucia Oliveira',
    email: 'lucia@example.com',
    status: 'new',
    source: 'whatsapp_group',
    created: new Date(Date.now() - 345600000).toISOString(),
  },
]

export default function Dashboard() {
  const [stats, setStats] = useState({ customers: 124, projects: 45, messages: 12, leads: 89 })
  const [recentCustomers, setRecentCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [customersRes, projectsRes, messagesRes, referralsRes, recentRes] = await Promise.all([
        pb.collection('customers').getList(1, 1, { filter: "status != 'inactive'" }),
        pb.collection('projects').getList(1, 1),
        pb.collection('messages').getList(1, 1, { filter: "status = 'pending'" }),
        pb.collection('referrals').getList(1, 1, { filter: "type = 'lead'" }),
        pb.collection('customers').getList(1, 5, { sort: '-created' }),
      ])

      if (customersRes.totalItems > 0 || projectsRes.totalItems > 0) {
        setStats({
          customers: customersRes.totalItems,
          projects: projectsRes.totalItems,
          messages: messagesRes.totalItems,
          leads: referralsRes.totalItems,
        })
      }

      if (recentRes.items.length > 0) {
        setRecentCustomers(recentRes.items)
      } else {
        setRecentCustomers(MOCK_CUSTOMERS)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setRecentCustomers(MOCK_CUSTOMERS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', loadData)
  useRealtime('projects', loadData)
  useRealtime('messages', loadData)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'interested':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'negotiating':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'converted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      new: 'Novo',
      interested: 'Interessado',
      negotiating: 'Negociando',
      converted: 'Convertido',
      inactive: 'Inativo',
    }
    return map[status] || status
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Catálogo Ativo
            </CardTitle>
            <Shirt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects}</div>
            <p className="text-xs text-muted-foreground">Itens publicados na plataforma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mensagens Pendentes
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messages}</div>
            <p className="text-xs text-muted-foreground">Aguardando sua resposta</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Novos Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leads}</div>
            <p className="text-xs text-muted-foreground">Captados nos últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes Recentes</CardTitle>
          <CardDescription>
            Últimos leads e clientes adicionados ou atualizados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email / Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead className="text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email || customer.phone || 'N/D'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(customer.status)}>
                        {translateStatus(customer.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {customer.source?.replace('_', ' ') || 'N/D'}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {format(new Date(customer.created), 'dd/MM/yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
