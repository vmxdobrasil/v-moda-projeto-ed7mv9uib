import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Package, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getFashionistaOrders } from '@/services/orders'
import { PickupQRDisplay } from '@/components/PickupQRDisplay'

const statusLabels: Record<string, string> = {
  pending: 'Aguardando Pagamento',
  paid: 'Pago',
  delivered: 'Entregue',
}

export default function FashionistaOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFashionistaOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link to="/fashionista">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-display font-bold">Meus Pedidos</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Package className="w-8 h-8 text-muted-foreground animate-pulse" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-20 text-center">
            <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">Você ainda não possui pedidos.</p>
            <Button asChild className="bg-[#FF6600] hover:bg-[#e65c00] text-white">
              <Link to="/fashionista/catalog">Explorar Catálogo</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge
                    variant={
                      order.status === 'paid'
                        ? 'default'
                        : order.status === 'delivered'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {statusLabels[order.status] || order.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-bold text-[#FF6600]">
                    R$ {(order.total_amount || 0).toFixed(2)}
                  </span>
                </div>
                {order.is_pickup && order.pickup_qr_code && order.status === 'paid' && (
                  <PickupQRDisplay
                    code={order.pickup_qr_code}
                    partnerName={order.expand?.pickup_partner_id?.name}
                    partnerAddress={order.expand?.pickup_partner_id?.address}
                  />
                )}
                {order.is_pickup && !order.pickup_qr_code && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-[#FF6600]" />
                    <span>Click & Collect - QR Code disponível após pagamento</span>
                  </div>
                )}
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={`/orders/view/${order.id}`}>Ver Detalhes</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
