import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Truck, Package, MapPin, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  collected: { label: 'Coletado', color: 'bg-blue-100 text-blue-800', icon: Package },
  in_transit: { label: 'Em Trânsito', color: 'bg-blue-100 text-blue-800', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  issue: { label: 'Problema', color: 'bg-red-100 text-red-800', icon: AlertCircle },
}

export default function LogisticaTransportadoras() {
  const { user } = useAuth()
  const [cargas, setCargas] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const isAdmin = user.role === 'admin' || user.email === 'valterpmendonca@gmail.com'
      const cargaFilter = isAdmin
        ? ''
        : `agent = "${user.id}" || customer.affiliate_referrer = "${user.id}"`
      const orderFilter = isAdmin ? '' : `seller_id = "${user.id}"`

      const [cargasData, ordersData] = await Promise.all([
        pb
          .collection('cargas_transporte')
          .getFullList({
            filter: cargaFilter,
            sort: '-created',
            expand: 'agent,excursion,customer,manufacturer,order',
          })
          .catch(() => []),
        pb
          .collection('orders')
          .getFullList({
            filter: orderFilter,
            sort: '-created',
            expand: 'customer,seller_id',
          })
          .catch(() => []),
      ])
      setCargas(cargasData)
      setOrders(ordersData)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('cargas_transporte', loadData)

  const stats = [
    {
      label: 'Pendentes',
      value: cargas.filter((c) => c.delivery_status === 'pending').length,
      color: 'text-yellow-600',
    },
    {
      label: 'Em Trânsito',
      value: cargas.filter(
        (c) => c.delivery_status === 'in_transit' || c.delivery_status === 'collected',
      ).length,
      color: 'text-blue-600',
    },
    {
      label: 'Entregues',
      value: cargas.filter((c) => c.delivery_status === 'delivered').length,
      color: 'text-green-600',
    },
    {
      label: 'Com Problema',
      value: cargas.filter((c) => c.delivery_status === 'issue').length,
      color: 'text-red-600',
    },
  ]

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-display">
          Logística & Transportadoras
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Rastreio consolidado de cargas, fretes e entregas.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="fashion-tech-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl md:text-2xl font-bold ${s.color}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="fashion-tech-card">
        <CardHeader>
          <CardTitle className="font-display">Cargas em Trânsito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cargas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma carga registrada.</p>
          ) : (
            cargas.map((c) => {
              const status = STATUS_CONFIG[c.delivery_status] || STATUS_CONFIG.pending
              const StatusIcon = status.icon
              return (
                <div
                  key={c.id}
                  className="flex items-start gap-3 p-3 md:p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors min-h-[80px]"
                >
                  <div
                    className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${status.color}`}
                  >
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium truncate text-sm md:text-base">
                        {c.expand?.customer?.name || c.description || 'Carga sem descrição'}
                      </p>
                      <Badge variant="outline" className={`shrink-0 text-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {c.expand?.manufacturer?.name && <span>{c.expand.manufacturer.name}</span>}
                      {c.volume_count && (
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {c.volume_count} vol
                        </span>
                      )}
                      {c.weight_kg && <span>{c.weight_kg} kg</span>}
                      {c.pickup_address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {c.pickup_address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card className="fashion-tech-card">
        <CardHeader>
          <CardTitle className="font-display">Pedidos com Logística</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum pedido encontrado.</p>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 p-3 md:p-4 rounded-xl border bg-muted/30 min-h-[60px]"
              >
                <div>
                  <p className="font-medium text-sm md:text-base">
                    Pedido #{o.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.expand?.customer?.name || o.guest_name || 'Cliente'} • R${' '}
                    {(o.total_amount || 0).toFixed(2)}
                  </p>
                </div>
                <Badge variant={o.status === 'paid' ? 'default' : 'secondary'}>{o.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
