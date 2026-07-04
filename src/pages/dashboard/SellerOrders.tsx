import { useState, useEffect, useCallback } from 'react'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, DollarSign, Package, Clock, RefreshCw, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { isSuperuserOrAdmin } from '@/lib/auth-redirects'
import { getSellerOrders, getAllOrders, getOrderItems, updateOrderStatus } from '@/services/orders'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando',
  paid: 'Pago',
  delivered: 'Entregue',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
  paid: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
  delivered: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
}

interface OrderItem {
  id: string
  quantity: number
  price_at_purchase: number
  selected_size: string
  selected_color: string
  expand?: {
    project_id?: {
      id: string
      name: string
      image?: string
      collectionId?: string
    }
  }
}

export default function SellerOrders() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const loadOrders = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const records = isSuperuserOrAdmin(user)
        ? await getAllOrders()
        : await getSellerOrders(user.id)
      setOrders(records)
    } catch (err: any) {
      console.error('Failed to load orders', err)
      setError(err?.message || 'Falha ao carregar pedidos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user, loadOrders])

  useRealtime('orders', () => {
    if (user) loadOrders()
  })

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order)
    setOrderItems([])
    setItemsLoading(true)
    try {
      const items = await getOrderItems(order.id)
      setOrderItems(items as OrderItem[])
    } catch (err) {
      console.error('Failed to load order items', err)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens do pedido.',
        variant: 'destructive',
      })
    } finally {
      setItemsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setStatusUpdating(true)
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
      toast({
        title: 'Status atualizado',
        description: `Pedido atualizado para ${STATUS_LABELS[newStatus] || newStatus}.`,
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      })
    } finally {
      setStatusUpdating(false)
    }
  }

  const pending = orders.filter((o) => o.status === 'pending')
  const paid = orders.filter((o) => o.status === 'paid')
  const delivered = orders.filter((o) => o.status === 'delivered')

  const totalCommissions = orders
    .filter((o) => o.status === 'paid' || o.status === 'delivered')
    .reduce((acc, o) => acc + (o.commission_amount || 0), 0)

  const isConsultant = user?.role === 'affiliate' || user?.role === 'agent'

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in-up">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <Card>
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight">Meus Pedidos</h1>
        <Card className="border-destructive/20">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <p className="text-muted-foreground text-center max-w-sm">{error}</p>
            <Button onClick={loadOrders} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Meus Pedidos</h1>
        <Button variant="outline" size="sm" onClick={loadOrders}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
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
          <OrdersTable
            orders={orders}
            onView={handleViewOrder}
            onStatusChange={handleStatusChange}
            statusUpdating={statusUpdating}
          />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <OrdersTable
            orders={pending}
            onView={handleViewOrder}
            onStatusChange={handleStatusChange}
            statusUpdating={statusUpdating}
          />
        </TabsContent>
        <TabsContent value="paid" className="mt-4">
          <OrdersTable
            orders={paid}
            onView={handleViewOrder}
            onStatusChange={handleStatusChange}
            statusUpdating={statusUpdating}
          />
        </TabsContent>
        <TabsContent value="delivered" className="mt-4">
          <OrdersTable
            orders={delivered}
            onView={handleViewOrder}
            onStatusChange={handleStatusChange}
            statusUpdating={statusUpdating}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <DialogDescription>Pedido #{selectedOrder?.id?.slice(0, 8)}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase mb-1">
                    Cliente
                  </span>
                  <p className="font-medium">
                    {selectedOrder.expand?.customer?.name ||
                      selectedOrder.guest_name ||
                      'Cliente Externo'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase mb-1">Data</span>
                  <p className="font-medium">
                    {new Date(selectedOrder.created).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase mb-1">Total</span>
                  <p className="font-medium">R$ {(selectedOrder.total_amount || 0).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase mb-1">Status</span>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(val) => handleStatusChange(selectedOrder.id, val)}
                    disabled={statusUpdating}
                  >
                    <SelectTrigger className="h-8 w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Aguardando</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-sm">Itens do Pedido</h4>
                {itemsLoading ? (
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : orderItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Nenhum item encontrado para este pedido.
                  </p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="h-9">Produto</TableHead>
                          <TableHead className="h-9 text-center">Qtd</TableHead>
                          <TableHead className="h-9 text-right">Preço</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="py-2">
                              <span className="font-medium">
                                {item.expand?.project_id?.name || 'Produto removido'}
                              </span>
                              {(item.selected_size || item.selected_color) && (
                                <span className="text-xs text-muted-foreground block">
                                  {item.selected_size && `Tam: ${item.selected_size}`}
                                  {item.selected_size && item.selected_color && ' · '}
                                  {item.selected_color && `Cor: ${item.selected_color}`}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="py-2 text-center">{item.quantity}</TableCell>
                            <TableCell className="py-2 text-right">
                              R$ {(item.price_at_purchase || 0).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center font-bold pt-4 border-t">
                <span>Total Geral</span>
                <span>R$ {(selectedOrder.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function OrdersTable({
  orders,
  onView,
  onStatusChange,
  statusUpdating,
}: {
  orders: any[]
  onView: (order: any) => void
  onStatusChange: (orderId: string, status: string) => void
  statusUpdating: boolean
}) {
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
                <TableCell className="font-medium text-xs font-mono">
                  {order.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  {order.expand?.customer?.name || order.guest_name || 'Cliente Externo'}
                </TableCell>
                <TableCell>{new Date(order.created).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="font-medium">
                  R$ {(order.total_amount || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(val) => onStatusChange(order.id, val)}
                    disabled={statusUpdating}
                  >
                    <SelectTrigger className="h-8 w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Aguardando</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onView(order)}>
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
