import { useEffect, useState } from 'react'
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
import { Users, Package, Target, Loader2, Plus, AlertCircle, TrendingUp } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { format, subDays, startOfDay } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface DashboardStats {
  totalLeads: number
  convertedLeads: number
  activeProjects: number
  activeManufacturers: number
}

interface RecentCustomer {
  id: string
  name?: string
  status?: string
  created?: string
}

interface ChartDataPoint {
  date: string
  leads: number
  startTs: number
  endTs: number
}

export default function DashboardHub() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    convertedLeads: 0,
    activeProjects: 0,
    activeManufacturers: 0,
  })
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const user = pb.authStore.record
  const isAdmin = user?.email === 'valterpmendonca@gmail.com' || user?.role === 'admin'

  const loadData = async () => {
    try {
      setError(null)
      const customerFilter = isAdmin
        ? ''
        : `manufacturer = "${user?.id}" || affiliate_referrer = "${user?.id}"`
      const convertedFilter = isAdmin
        ? 'status="converted"'
        : `(manufacturer = "${user?.id}" || affiliate_referrer = "${user?.id}") && status="converted"`
      const projectFilter = isAdmin ? '' : `manufacturer = "${user?.id}"`

      const [leadsRes, convertedRes, projectsRes, mfgRes, recentRes, chartRes] = await Promise.all([
        pb.collection('customers').getList(1, 1, { filter: customerFilter }),
        pb.collection('customers').getList(1, 1, { filter: convertedFilter }),
        pb.collection('projects').getList(1, 1, { filter: projectFilter }),
        isAdmin
          ? pb.collection('users').getList(1, 1, { filter: 'role="manufacturer"' })
          : Promise.resolve({ totalItems: 0 }),
        pb
          .collection('customers')
          .getList<RecentCustomer>(1, 5, { sort: '-created', filter: customerFilter }),
        pb
          .collection('customers')
          .getList<RecentCustomer>(1, 500, { sort: '-created', filter: customerFilter }),
      ])

      setStats({
        totalLeads: leadsRes.totalItems || 0,
        convertedLeads: convertedRes.totalItems || 0,
        activeProjects: projectsRes.totalItems || 0,
        activeManufacturers: mfgRes.totalItems || 0,
      })

      setRecentCustomers(recentRes.items)

      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i)
        return {
          date: format(d, 'dd/MM'),
          leads: 0,
          startTs: startOfDay(d).getTime(),
          endTs: startOfDay(d).getTime() + 86400000,
        }
      })

      chartRes.items.forEach((c) => {
        if (!c.created) return
        const cDate = new Date(c.created).getTime()
        const bucket = days.find((b) => cDate >= b.startTs && cDate < b.endTs)
        if (bucket) bucket.leads++
      })

      setChartData(days)
    } catch (err) {
      console.error('Failed to load dashboard data', err)
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

  const chartConfig = {
    leads: {
      label: 'Leads Gerados',
      color: 'hsl(var(--primary))',
    },
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl w-full mx-auto animate-fade-in pb-10">
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
              <Link to="/dashboard/customers?new=true">
                <Plus className="h-4 w-4" />
                Adicionar Lead
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="gap-2 bg-background border shadow-sm hover:bg-muted"
            >
              <Link to="/dashboard/products?new=true">
                <Package className="h-4 w-4" />
                Criar Produto
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="gap-2 bg-background shadow-sm hover:bg-muted"
            >
              <Link to="/dashboard/customers">
                <Users className="h-4 w-4" />
                Ver Todos os Clientes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {isAdmin ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Leads (Geral)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
                <p className="text-xs text-muted-foreground mt-1">Leads gerados na plataforma</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalLeads > 0
                    ? ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1) + '%'
                    : '0%'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.convertedLeads} leads convertidos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Produtos registrados globalmente
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meus Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Clientes cadastrados na sua base
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalLeads > 0
                    ? ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1) + '%'
                    : '0%'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.convertedLeads} clientes realizaram compras
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">Seus produtos no catálogo</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Evolução de Leads
            </CardTitle>
            <CardDescription>Volume de novos contatos nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltipContent />} />
                <Bar dataKey="leads" fill="var(--color-leads)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Clientes Recentes</CardTitle>
            <CardDescription>Últimas movimentações no seu CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        Nenhum cliente recente encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer?.name || 'Sem nome'}
                        </TableCell>
                        <TableCell>{getStatusBadge(customer?.status)}</TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {customer?.created
                            ? format(new Date(customer.created), 'dd/MM/yyyy')
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
    </div>
  )
}
