import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FolderKanban, Star, MessageSquare, Activity, Calendar } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export default function DashboardHub() {
  const [stats, setStats] = useState({
    leads: 0,
    projects: 0,
    averageRating: 0,
    pendingMessages: 0,
  })
  const [recentCustomers, setRecentCustomers] = useState<any[]>([])

  const loadData = async () => {
    const user = pb.authStore.record
    if (!user) return

    const isAdmin = user.email === 'valterpmendonca@gmail.com' || user.role === 'admin'
    const isManufacturer = user.role === 'manufacturer' || user.type === 'Lojista Fabricante'

    try {
      // 1. Leads
      let leadsRes
      if (isAdmin) {
        leadsRes = await pb.collection('customers').getList(1, 1)
      } else if (isManufacturer) {
        leadsRes = await pb
          .collection('customers')
          .getList(1, 1, { filter: `manufacturer = "${user.id}"` })
      } else {
        leadsRes = await pb
          .collection('customers')
          .getList(1, 1, { filter: `affiliate_referrer = "${user.id}"` })
      }

      // 2. Projects
      let projectsRes
      if (isAdmin) {
        projectsRes = await pb.collection('projects').getList(1, 1)
      } else if (isManufacturer) {
        projectsRes = await pb
          .collection('projects')
          .getList(1, 1, { filter: `manufacturer = "${user.id}"` })
      } else {
        projectsRes = { totalItems: 0 } as any
      }

      // 3. Average Rating
      let reviewsRes
      if (isAdmin) {
        reviewsRes = await pb.collection('reviews').getFullList()
      } else if (isManufacturer) {
        reviewsRes = await pb.collection('reviews').getFullList({ filter: `brand = "${user.id}"` })
      } else {
        reviewsRes = []
      }

      const avgRating =
        reviewsRes.length > 0
          ? reviewsRes.reduce((acc: number, curr: any) => acc + curr.rating, 0) / reviewsRes.length
          : 0

      // 4. Pending Messages
      const messagesRes = await pb
        .collection('messages')
        .getList(1, 1, { filter: `status = 'pending'` })

      setStats({
        leads: leadsRes.totalItems,
        projects: projectsRes.totalItems,
        averageRating: Number(avgRating.toFixed(1)),
        pendingMessages: messagesRes.totalItems,
      })

      // Recent Customers
      let activityRes
      if (isAdmin) {
        activityRes = await pb.collection('customers').getList(1, 5, { sort: '-created' })
      } else if (isManufacturer) {
        activityRes = await pb
          .collection('customers')
          .getList(1, 5, { filter: `manufacturer = "${user.id}"`, sort: '-created' })
      } else {
        activityRes = await pb
          .collection('customers')
          .getList(1, 5, { filter: `affiliate_referrer = "${user.id}"`, sort: '-created' })
      }
      setRecentCustomers(activityRes.items)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', loadData)
  useRealtime('projects', loadData)
  useRealtime('reviews', loadData)
  useRealtime('messages', loadData)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'interested':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
      case 'negotiating':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
      case 'converted':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

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
        return status || 'Novo'
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Painel de Controle</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Visão geral consolidada dos seus indicadores e clientes recentes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:border-primary/50 transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leads}</div>
            <p className="text-xs text-muted-foreground mt-1">Clientes e prospects no funil</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects}</div>
            <p className="text-xs text-muted-foreground mt-1">Produtos em catálogo</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground mt-1">Baseado nas avaliações</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Pendentes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando sua resposta</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" /> Clientes Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCustomers.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-12 flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p>Nenhum cliente encontrado no momento. Seus novos contatos aparecerão aqui.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Nome
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Data de Criação
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {recentCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle font-medium">
                        {customer.name || 'Sem nome'}
                      </td>
                      <td className="p-4 align-middle">
                        <Badge
                          className={getStatusColor(customer.status || 'new')}
                          variant="outline"
                        >
                          {getStatusLabel(customer.status || 'new')}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-right text-muted-foreground">
                        <div className="flex items-center justify-end gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(customer.created), 'dd/MM/yyyy HH:mm')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
