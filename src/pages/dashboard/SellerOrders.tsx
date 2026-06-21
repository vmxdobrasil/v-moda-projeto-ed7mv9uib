import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
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
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, DollarSign, Package, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  async function loadOrders() {
    try {
      const records = await pb.collection('orders').getFullList({
        sort: '-created',
        filter: user?.role === 'admin' ? '' : `seller_id="${user?.id}"`,
        expand: 'customer',
      })
      setOrders(records)
    } catch (e) {
      console.error(e)
    }
  }

  const pending = orders.filter((o) => o.status === 'pending')
  const paid = orders.filter((o) => o.status === 'paid')
  const delivered = orders.filter((o) => o.status === 'delivered')

  const totalCommissions = orders
    .filter((o) => o.status === 'paid' || o.status === 'delivered')
    .reduce((acc, o) => acc + (o.commission_amount || 0), 0)

  const isConsultant = user?.role === 'affiliate' || user?.role === 'agent'

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Meus Pedidos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Pagamento</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagos (A Enviar)</CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paid.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <Package className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{delivered.length}</div>
          </CardContent>
        </Card>
        {isConsultant && (
          <Card className="bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
                Comissões Acumuladas
              </CardTitle>
              <DollarSign className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                R$ {totalCommissions.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todos ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">Aguardando ({pending.length})</TabsTrigger>
          <TabsTrigger value="paid">Pagos ({paid.length})</TabsTrigger>
          <TabsTrigger value="delivered">Entregues ({delivered.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <OrdersTable orders={orders} />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <OrdersTable orders={pending} />
        </TabsContent>
        <TabsContent value="paid" className="mt-4">
          <OrdersTable orders={paid} />
        </TabsContent>
        <TabsContent value="delivered" className="mt-4">
          <OrdersTable orders={delivered} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OrdersTable({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border rounded-lg bg-card">
        Nenhum pedido encontrado.
      </div>
    )
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-xs font-mono">{order.id}</TableCell>
                <TableCell>
                  {order.expand?.customer?.name || order.guest_name || 'Cliente Externo'}
                </TableCell>
                <TableCell>{new Date(order.created).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="font-medium">
                  R$ {(order.total_amount || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={order.status === 'pending' ? 'outline' : 'default'}
                    className={
                      order.status === 'paid'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200'
                        : ''
                    }
                  >
                    {order.status === 'pending'
                      ? 'Aguardando'
                      : order.status === 'paid'
                        ? 'Pago'
                        : 'Entregue'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/orders/view/${order.id}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
