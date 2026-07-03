import { useState } from 'react'
import useCartStore from '@/stores/useCartStore'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Trash2, ShoppingBag, Share2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Link, useNavigate } from 'react-router-dom'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const total = items.reduce((acc, item) => acc + (item.product.price || 0) * item.quantity, 0)

  const handleShare = async () => {
    if (items.length === 0) return
    try {
      setLoading(true)
      const commissionRate = user?.commission_rate || 0
      const commissionAmount = total * commissionRate

      const orderData: any = {
        status: 'pending',
        total_amount: total,
        commission_amount: commissionAmount,
      }

      if (user) {
        orderData.seller_id = user.id
      }

      const order = await pb.collection('orders').create(orderData)

      for (const item of items) {
        await pb.collection('order_items').create({
          order_id: order.id,
          project_id: item.product.id,
          quantity: item.quantity,
          price_at_purchase: item.product.price || 0,
          selected_size: item.size || '',
          selected_color: item.color || '',
        })
      }

      clearCart()

      const orderUrl = `${window.location.origin}/orders/view/${order.id}`
      const text = `Olá! Seu pedido com ${
        items.length
      } itens está pronto para confirmação. O total é R$ ${total.toFixed(
        2,
      )}. Acesse o link para conferir e finalizar o pagamento: ${orderUrl}`
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
      window.open(whatsappUrl, '_blank')

      toast({
        title: 'Sucesso',
        description: 'Pedido gerado e link do WhatsApp aberto.',
      })
      if (user) {
        navigate('/seller-orders')
      }
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Erro ao gerar pedido.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  function getImageUrl(product: any) {
    if (product.gallery) {
      return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${product.collectionId}/${product.id}/${product.gallery}?thumb=100x100`
    }
    if (product.image) {
      return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${product.collectionId}/${product.id}/${product.image}?thumb=100x100`
    }
    return `https://img.usecurling.com/p/100/100?q=fashion`
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-5xl animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Minha Sacola de Compras</h1>
        <Button variant="outline" asChild>
          <Link to="/colecoes">Continuar Comprando</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Sua sacola está vazia</h2>
          <p className="text-muted-foreground mb-6">
            Explore nosso catálogo e adicione produtos ao carrinho.
          </p>
          <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
            <Link to="/colecoes">Ver Catálogo</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Itens ({items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Detalhes</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={getImageUrl(item.product)}
                                alt={item.product.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <span className="font-medium truncate max-w-[120px] md:max-w-[200px]">
                                {item.product.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {item.size && <div>Tam: {item.size}</div>}
                              {item.color && <div>Cor: {item.color}</div>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.id, parseInt(e.target.value) || 1)
                              }
                              className="w-16 p-1 border rounded text-center"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium text-orange-600">
                            R$ {((item.product.price || 0) * item.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">R$ {total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                  onClick={handleShare}
                  disabled={loading}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {loading ? 'Gerando...' : 'Compartilhar Pedido via WhatsApp'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
