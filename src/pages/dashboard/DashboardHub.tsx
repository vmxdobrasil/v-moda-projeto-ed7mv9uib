import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Package, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function DashboardHub() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    customers: 0,
    projects: 0,
  })
  const [latestLeads, setLatestLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const isAdmin = user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com'
      const customerFilter = isAdmin
        ? ''
        : `manufacturer = "${user?.id}" || affiliate_referrer = "${user?.id}"`

      const projectFilter = isAdmin ? '' : `manufacturer = "${user?.id}"`

      const [customersRes, projectsRes, leadsRes] = await Promise.all([
        pb.collection('customers').getList(1, 1, { filter: customerFilter, $autoCancel: false }),
        pb.collection('projects').getList(1, 1, { filter: projectFilter, $autoCancel: false }),
        pb.collection('customers').getList(1, 5, {
          filter: customerFilter,
          sort: '-created',
          $autoCancel: false,
        }),
      ])

      setStats({
        customers: customersRes.totalItems,
        projects: projectsRes.totalItems,
      })
      setLatestLeads(leadsRes.items)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadData()
  }, [user])

  useRealtime('customers', () => loadData())
  useRealtime('projects', () => loadData())

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'Novo'
      case 'interested':
        return 'Interessado'
      case 'negotiating':
        return 'Em Negociação'
      case 'converted':
        return 'Convertido'
      case 'inactive':
        return 'Inativo'
      default:
        return status || 'Indefinido'
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo de volta! Aqui está o resumo do seu negócio.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <span className="animate-pulse">...</span> : stats.customers}
            </div>
            <p className="text-xs text-muted-foreground mt-1 mb-3">Base total de clientes</p>
            <Link
              to="/customers"
              className="text-xs font-medium text-primary flex items-center hover:underline"
            >
              Ver detalhes
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos no Catálogo</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <span className="animate-pulse">...</span> : stats.projects}
            </div>
            <p className="text-xs text-muted-foreground mt-1 mb-3">Produtos ativos</p>
            <Link
              to="/products"
              className="text-xs font-medium text-primary flex items-center hover:underline"
            >
              Ver detalhes
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Leads</CardTitle>
          <CardDescription>Os 5 leads mais recentes cadastrados no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email/Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : latestLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    Nenhum lead encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                latestLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email || lead.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getStatusLabel(lead.status)}</Badge>
                    </TableCell>
                    <TableCell>{new Date(lead.created).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
