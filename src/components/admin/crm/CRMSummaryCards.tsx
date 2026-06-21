import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Users, UserCheck, Star, MessageCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export function CRMSummaryCards() {
  const [stats, setStats] = useState({
    topBrands: 0,
    agents: 0,
    retailers: 0,
    consultants: 0,
    whatsappSales: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const [brands, agents, retailers, consultants, whatsappSales] = await Promise.all([
          pb.collection('customers').getList(1, 1, {
            filter: "ranking_position > 0 && ranking_position <= 60 && status != 'inactive'",
          }),
          pb.collection('users').getList(1, 1, { filter: "role = 'agent'" }),
          pb.collection('users').getList(1, 1, { filter: "role = 'retailer'" }),
          pb.collection('users').getList(1, 1, {
            filter:
              "role = 'affiliate' || segment_tier = 'fashion_consultant' || segment_tier = 'exclusive_consultant' || segment_tier = 'premium_consultant'",
          }),
          pb.collection('customers').getList(1, 1, {
            filter:
              "(source = 'whatsapp' || source = 'whatsapp_group') && (status = 'converted' || status = 'closed')",
          }),
        ])

        setStats({
          topBrands: brands.totalItems,
          agents: agents.totalItems,
          retailers: retailers.totalItems,
          consultants: consultants.totalItems,
          whatsappSales: whatsappSales.totalItems,
        })
      } catch (err) {
        console.error('Failed to fetch CRM summary stats', err)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top 60 Marcas Ativas</CardTitle>
          <Star className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.topBrands}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agentes Credenciados</CardTitle>
          <UserCheck className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.agents}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lojistas / Revenda</CardTitle>
          <Store className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.retailers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Consultoras de Moda</CardTitle>
          <Users className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.consultants}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendas WhatsApp</CardTitle>
          <MessageCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.whatsappSales}</div>
        </CardContent>
      </Card>
    </div>
  )
}
