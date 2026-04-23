import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users, Package, MessageSquare, Loader2, Plus, AlertCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { format } from 'date-fns'

interface DashboardStats {
  totalLeads: number
  activeProjects: number
  pendingMessages: number
}

interface RecentCustomer {
  id: string
  name?: string
  status?: string
  created?: string
}

export default function DashboardHub() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    activeProjects: 0,
    pendingMessages: 0,
  })
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setError(null)
      const [leadsRes, projectsRes, messagesRes, recentRes] = await Promise.all([
        pb
          .collection('customers')
          .getList(1, 1)
          .catch((e) => {
            console.error('Error fetching customers count:', e)
            return { totalItems: 0 }
          }),
        pb
          .collection('projects')
          .getList(1, 1)
          .catch((e) => {
            console.error('Error fetching projects count:', e)
            return { totalItems: 0 }
          }),
        pb
          .collection('messages')
          .getList(1, 1, { filter: "status='pending'" })
          .catch((e) => {
            console.error('Error fetching messages count:', e)
            return { totalItems: 0 }
          }),
        pb
          .collection('customers')
          .getList<RecentCustomer>(1, 5, { sort: '-created' })
          .catch((e) => {
            console.error('Error fetching recent customers:', e)
            return { items: [] }
          }),
      ])

      setStats({
        totalLeads: leadsRes?.totalItems || 0,
        activeProjects: projectsRes?.totalItems || 0,
        pendingMessages: messagesRes?.totalItems || 0,
      })
      setRecentCustomers(recentRes?.items || [])
    } catch (error) {
      console.error('Failed to load dashboard data', error)
      setError('Não foi possível carregar alguns dados do painel.')
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

  const getStatusBadge = (status?: string) => {
    const s = status || 'new'
    switch (s) {
      case 'new':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Novo</Badge>
      case 'interested':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Interessado</Badge>
      case 'negotiating':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Negociando</Badge>
      case 'converted':
        return <Badge className="bg-green-500 hover:bg-green-600">Convertido</Badge>
      case 'inactive':
        return (
          <Badge variant="outline" className="text-gray-500">
            Inativo
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="capitalize">
            {s}
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl w-full mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Início</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do seu negócio e atividades recentes.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="md:col-span-3 bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild className="gap-2">
              <Link to="/dashboard/clientes?new=true">
                <Plus className="h-4 w-4" />
                Adicionar Lead
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="gap-2 bg-background border shadow-sm hover:bg-muted"
            >
              <Link to="/dashboard/produtos?new=true">
                <Package className="h-4 w-4" />
                Criar Produto
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="gap-2 bg-background shadow-sm hover:bg-muted"
            >
              <Link to="/dashboard/clientes">
                <Users className="h-4 w-4" />
                Ver Todos os Clientes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">Clientes cadastrados na base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">Produtos no catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Pendentes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando resposta</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Data de Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer?.name || 'Sem nome'}</TableCell>
                      <TableCell>{getStatusBadge(customer?.status)}</TableCell>
                      <TableCell className="text-right">
                        {customer?.created
                          ? format(new Date(customer.created), 'dd/MM/yyyy HH:mm')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
