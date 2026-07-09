import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, CreditCard, Package } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

export function AdminMasterMetrics() {
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    newLeads: 0,
    activeCards: 0,
    totalProducts: 0,
  })

  const loadData = async () => {
    try {
      const [orders, customers, cards, products] = await Promise.all([
        pb
          .collection('orders')
          .getFullList({ filter: "status = 'paid'" })
          .catch(() => []),
        pb
          .collection('customers')
          .getList(1, 1)
          .catch(() => ({ totalItems: 0 })),
        pb
          .collection('v_club_cards')
          .getList(1, 1, { filter: "status = 'active'" })
          .catch(() => ({ totalItems: 0 })),
        pb
          .collection('projects')
          .getList(1, 1)
          .catch(() => ({ totalItems: 0 })),
      ])
      setMetrics({
        totalSales: (orders as any[]).reduce((s, o) => s + (o.total_amount || 0), 0),
        newLeads: (customers as any).totalItems || 0,
        activeCards: (cards as any).totalItems || 0,
        totalProducts: (products as any).totalItems || 0,
      })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('orders', loadData)
  useRealtime('customers', loadData)
  useRealtime('v_club_cards', loadData)
  useRealtime('projects', loadData)

  const items = [
    {
      label: 'Vendas Totais',
      value: `R$ ${metrics.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-primary',
    },
    { label: 'Novos Leads', value: metrics.newLeads, icon: Users, color: 'text-electric' },
    {
      label: 'Cartões Ativos',
      value: metrics.activeCards,
      icon: CreditCard,
      color: 'text-emerald',
    },
    { label: 'Produtos', value: metrics.totalProducts, icon: Package, color: 'text-navy' },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} className="rounded-2xl shadow-soft hover-depth border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-display">{item.label}</CardTitle>
              <Icon className={`h-5 w-5 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{item.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
