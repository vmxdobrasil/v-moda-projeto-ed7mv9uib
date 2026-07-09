import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Users, Wallet, TrendingUp, Activity } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

export function AdminMasterMetrics() {
  const [orders, setOrders] = useState<any[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [finAccounts, setFinAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [ord, cust, finAcc] = await Promise.all([
        pb
          .collection('orders')
          .getFullList({ sort: '-created' })
          .catch(() => []),
        pb
          .collection('customers')
          .getList(1, 1)
          .catch(() => ({ totalItems: 0 })),
        pb
          .collection('financial_accounts')
          .getFullList()
          .catch(() => []),
      ])
      setOrders(ord as any[])
      setCustomerCount((cust as any).totalItems || 0)
      setFinAccounts(finAcc as any[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('orders', loadData)
  useRealtime('customers', loadData)
  useRealtime('financial_accounts', loadData)

  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((s, o) => s + (o.total_amount || 0), 0)
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const receivables = finAccounts
    .filter((f) => f.type === 'receivable' && f.status !== 'paid')
    .reduce((s, f) => s + (f.amount || 0), 0)
  const payables = finAccounts
    .filter((f) => f.type === 'payable' && f.status !== 'paid')
    .reduce((s, f) => s + (f.amount || 0), 0)

  const stats = [
    {
      label: 'Receita Total',
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      label: 'Pedidos Pendentes',
      value: pendingOrders,
      icon: ShoppingCart,
      color: 'text-electric',
    },
    {
      label: 'Clientes',
      value: customerCount,
      icon: Users,
      color: 'text-navy',
    },
    {
      label: 'A Receber',
      value: `R$ ${receivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-emerald',
    },
    {
      label: 'A Pagar',
      value: `R$ ${payables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Wallet,
      color: 'text-destructive',
    },
    {
      label: 'Pedidos Totais',
      value: orders.length,
      icon: Activity,
      color: 'text-azul',
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="rounded-2xl shadow-soft border-primary/10 animate-pulse">
            <CardContent className="p-6 h-24" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <Card key={s.label} className="rounded-2xl shadow-soft hover-depth border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-display">{s.label}</CardTitle>
              <Icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{s.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
