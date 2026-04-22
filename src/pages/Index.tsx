import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { Users, ShoppingBag, Building2, Store, Share2, ArrowRight } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import pb from '@/lib/pocketbase/client'

const chartData = [
  { month: 'Jan', sales: 4000, leads: 2400 },
  { month: 'Fev', sales: 3000, leads: 1398 },
  { month: 'Mar', sales: 2000, leads: 9800 },
  { month: 'Abr', sales: 2780, leads: 3908 },
  { month: 'Mai', sales: 1890, leads: 4800 },
  { month: 'Jun', sales: 2390, leads: 3800 },
  { month: 'Jul', sales: 3490, leads: 4300 },
]

export default function Index() {
  const { user } = useAuth()

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProjects: 0,
    totalManufacturers: 0,
    totalRetailers: 0,
    totalAffiliates: 0,
  })

  const [recentCustomers, setRecentCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          customersReq,
          projectsReq,
          manufacturersReq,
          retailersReq,
          affiliatesReq,
          recentCustReq,
        ] = await Promise.all([
          pb.collection('customers').getList(1, 1),
          pb.collection('projects').getList(1, 1),
          pb.collection('users').getList(1, 1, { filter: 'role="manufacturer"' }),
          pb.collection('users').getList(1, 1, { filter: 'role="retailer"' }),
          pb.collection('users').getList(1, 1, { filter: 'role="affiliate"' }),
          pb.collection('customers').getList(1, 5, { sort: '-created' }),
        ])

        setStats({
          totalCustomers: customersReq.totalItems,
          totalProjects: projectsReq.totalItems,
          totalManufacturers: manufacturersReq.totalItems,
          totalRetailers: retailersReq.totalItems,
          totalAffiliates: affiliatesReq.totalItems,
        })

        setRecentCustomers(recentCustReq.items)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo de volta{user?.name ? `, ${user.name}` : ''}. Visão geral do seu negócio.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/customers">Gerenciar Clientes</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos (Projetos)</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fabricantes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalManufacturers}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lojistas (Varejo)</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalRetailers}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Afiliados</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalAffiliates}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Últimos Clientes</CardTitle>
              <CardDescription>Clientes cadastrados recentemente na plataforma.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/customers">
                Ver todos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead className="text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-4 w-20 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  : recentCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{customer.name}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {customer.email || customer.phone || 'Sem contato'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={customer.status === 'converted' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {customer.status || 'Novo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {customer.source?.replace('_', ' ') || 'Manual'}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Date(customer.created).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                {!isLoading && recentCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>Performance de vendas e leads.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                sales: { label: 'Vendas', color: 'hsl(var(--primary))' },
                leads: { label: 'Leads', color: 'hsl(var(--muted-foreground))' },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `R$${value}`}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leads" fill="var(--color-leads)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
