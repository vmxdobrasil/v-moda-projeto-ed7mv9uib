import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Package, ArrowLeft, Star, MessageSquare } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatPrice } from '@/lib/data'

interface OrderItem {
  name: string
  quantity: number
  price: number
  size?: string
}

interface Order {
  id: string
  date: string
  total: number
  status: string
  items: OrderItem[]
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'PED-1030',
    date: '28/03/2026',
    total: 3200.0,
    status: 'Processando',
    items: [{ name: 'Bolsa Couro Estruturada', quantity: 1, price: 3200.0, size: 'Único' }],
  },
  {
    id: 'PED-1029',
    date: '15/02/2026',
    total: 1290.0,
    status: 'Entregue',
    items: [{ name: 'Vestido de Seda Minimalista', quantity: 1, price: 1290.0, size: 'M' }],
  },
  {
    id: 'PED-1025',
    date: '10/01/2026',
    total: 2950.0,
    status: 'Entregue',
    items: [
      { name: 'Blazer Estruturado em Lã', quantity: 1, price: 1850.0, size: 'P' },
      { name: 'Sapato Scarpin Verniz', quantity: 1, price: 1100.0, size: '37' },
    ],
  },
]

const statusColors: Record<string, string> = {
  Processando: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  Enviado: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  Entregue: 'bg-green-500/10 text-green-600 border-green-500/20',
}

export default function Orders() {
  const { toast } = useToast()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [reviewItem, setReviewItem] = useState<{ orderId: string; item: OrderItem } | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')

  const handleReviewSubmit = () => {
    toast({
      title: 'Avaliação enviada!',
      description: 'Obrigado por avaliar este produto.',
    })
    setReviewItem(null)
    setReviewRating(5)
    setReviewComment('')
  }

  return (
    <div className="container py-24 md:py-32 min-h-[70vh]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-serif">Meus Pedidos</h1>
        </div>

        <div className="bg-background border rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-center w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ORDERS.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[order.status] || ''}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(order.total)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="gap-2 text-xs"
                    >
                      <Eye className="w-4 h-4" /> Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {MOCK_ORDERS.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <Package className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg text-muted-foreground">Você ainda não possui pedidos.</p>
              <Button
                asChild
                variant="outline"
                className="mt-6 rounded-none uppercase tracking-widest"
              >
                <Link to="/colecoes">Começar a Comprar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif mb-2">Detalhes do Pedido</DialogTitle>
            <DialogDescription>
              Acompanhe as informações do seu pedido {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data da Compra</p>
                  <p className="font-medium">{selectedOrder.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline" className={statusColors[selectedOrder.status]}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Itens do Pedido</h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap justify-between items-center gap-4 text-sm border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{item.quantity}x</span>
                        <div className="flex flex-col">
                          <span className="line-clamp-1">{item.name}</span>
                          {item.size && (
                            <span className="text-xs text-muted-foreground">
                              Tamanho: {item.size}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-auto">
                        <span className="font-medium whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        {selectedOrder.status === 'Entregue' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 gap-1.5"
                            onClick={() => setReviewItem({ orderId: selectedOrder.id, item })}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Avaliar Produto
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-between items-center">
                <span className="font-medium uppercase tracking-wider text-sm">Total Gasto</span>
                <span className="text-xl font-serif text-primary">
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!reviewItem} onOpenChange={(open) => !open && setReviewItem(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif mb-2">Avaliar Produto</DialogTitle>
            <DialogDescription>
              Compartilhe sua experiência com o produto {reviewItem?.item.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div>
              <span className="block text-sm font-medium mb-2">Sua Nota</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        'w-8 h-8 transition-colors',
                        star <= reviewRating
                          ? 'fill-accent text-accent'
                          : 'text-muted-foreground/30 hover:text-accent/50',
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium mb-2">Seu Comentário</span>
              <Textarea
                placeholder="O que você achou do produto? O caimento é bom? A cor é igual à da foto?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="min-h-[120px] resize-none focus-visible:ring-accent"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setReviewItem(null)}>
              Cancelar
            </Button>
            <Button onClick={handleReviewSubmit}>Enviar Avaliação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
