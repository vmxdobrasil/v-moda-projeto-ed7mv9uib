import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Mock Data
const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    customer: 'Ana Silva',
    date: '2023-10-25',
    status: 'Pago',
    total: 1250.0,
    items: [{ name: 'Vestido Seda Longo', qty: 1, price: 1250.0 }],
    address: 'Rua das Flores, 123 - São Paulo, SP',
  },
  {
    id: 'ORD-002',
    customer: 'Carlos Santos',
    date: '2023-10-24',
    status: 'Pendente',
    total: 450.0,
    items: [{ name: 'Camisa Linho', qty: 1, price: 450.0 }],
    address: 'Av Paulista, 1000 - São Paulo, SP',
  },
  {
    id: 'ORD-003',
    customer: 'Marina Costa',
    date: '2023-10-23',
    status: 'Enviado',
    total: 890.0,
    items: [{ name: 'Calça Pantalona', qty: 1, price: 890.0 }],
    address: 'Rua do Comércio, 45 - Rio de Janeiro, RJ',
  },
  {
    id: 'ORD-004',
    customer: 'João Oliveira',
    date: '2023-10-22',
    status: 'Cancelado',
    total: 1500.0,
    items: [{ name: 'Blazer Alfaiataria', qty: 1, price: 1500.0 }],
    address: 'Quadra 10, Lote 5 - Brasília, DF',
  },
]

export default function Orders() {
  const { toast } = useToast()
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [selectedOrder, setSelectedOrder] = useState<(typeof MOCK_ORDERS)[0] | null>(null)

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
    toast({
      title: 'Status Atualizado',
      description: `O pedido ${orderId} foi atualizado para ${newStatus}.`,
    })
  }

  const filteredOrders = useMemo(() => {
    return statusFilter === 'Todos' ? orders : orders.filter((o) => o.status === statusFilter)
  }, [orders, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'bg-emerald-500 hover:bg-emerald-600'
      case 'Pendente':
        return 'bg-amber-500 hover:bg-amber-600'
      case 'Enviado':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'Entregue':
        return 'bg-purple-500 hover:bg-purple-600'
      case 'Cancelado':
        return 'bg-rose-500 hover:bg-rose-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerenciar Pedidos</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Acompanhe e atualize o status dos pedidos.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
          <CardTitle className="text-lg">Últimos Pedidos</CardTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os Status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                const headers = [
                  'ID do Pedido',
                  'Cliente',
                  'Data',
                  'Status',
                  'Valor Total',
                  'Endereço',
                ]
                const rows = filteredOrders.map((order) => [
                  order.id,
                  order.customer,
                  new Date(order.date).toLocaleDateString('pt-BR'),
                  order.status,
                  order.total.toFixed(2),
                  `"${order.address}"`,
                ])
                const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                const link = document.createElement('a')
                const url = URL.createObjectURL(blob)
                link.setAttribute('href', url)
                link.setAttribute('download', 'pedidos_vmoda.csv')
                link.style.visibility = 'hidden'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID do Pedido</TableHead>
                  <TableHead>Nome do Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-center w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(val) => handleStatusChange(order.id, val)}
                      >
                        <SelectTrigger
                          className={`h-8 w-[130px] text-white border-none focus:ring-0 ${getStatusColor(order.status)}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Pago">Pago</SelectItem>
                          <SelectItem value="Enviado">Enviado</SelectItem>
                          <SelectItem value="Entregue">Entregue</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      R$ {order.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum pedido encontrado com este filtro.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm bg-muted/50 p-4 rounded-lg">
                <div>
                  <span className="font-semibold text-muted-foreground block text-xs uppercase mb-1">
                    Cliente
                  </span>
                  <p>{selectedOrder.customer}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block text-xs uppercase mb-1">
                    Status
                  </span>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(val) => handleStatusChange(selectedOrder.id, val)}
                  >
                    <SelectTrigger
                      className={`h-8 w-[130px] text-white border-none focus:ring-0 ${getStatusColor(selectedOrder.status)}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Enviado">Enviado</SelectItem>
                      <SelectItem value="Entregue">Entregue</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-muted-foreground block text-xs uppercase mb-1">
                    Endereço de Entrega
                  </span>
                  <p>{selectedOrder.address}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-sm">Itens do Pedido</h4>
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
                      {selectedOrder.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="py-2">{item.name}</TableCell>
                          <TableCell className="py-2 text-center">{item.qty}</TableCell>
                          <TableCell className="py-2 text-right">
                            R$ {item.price.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-between items-center font-bold text-lg pt-4 border-t">
                <span>Total Final</span>
                <span>R$ {selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
