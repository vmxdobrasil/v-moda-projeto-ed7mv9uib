import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import useCartStore from '@/stores/useCartStore'
import { formatPrice } from '@/lib/data'

export default function Checkout() {
  const { items: cartItems, cartTotal } = useCartStore()
  const { toast } = useToast()

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Pedido confirmado',
      description: 'Obrigado pela sua compra! Em breve você receberá um e-mail com os detalhes.',
    })
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-24 md:py-32 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-serif mb-6">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground mb-8">Adicione alguns produtos para continuar.</p>
        <Button asChild className="rounded-none h-12 px-8 uppercase tracking-widest">
          <Link to="/colecoes">Continuar Comprando</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-24 md:py-32">
      <h1 className="text-3xl md:text-4xl font-serif mb-12">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        {/* Formulário de Entrega */}
        <div>
          <h2 className="text-xl font-medium mb-6 uppercase tracking-wider">
            Informações de Entrega
          </h2>
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" placeholder="00000-000" required />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input id="number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" required />
              </div>
            </div>
          </form>
        </div>

        {/* Resumo do Pedido */}
        <div className="bg-secondary/20 p-6 md:p-8">
          <h2 className="text-xl font-medium mb-6 uppercase tracking-wider">Resumo do Pedido</h2>

          <div className="overflow-x-auto mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-16 object-cover hidden sm:block"
                        />
                        <span className="line-clamp-2">{item.product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatPrice(item.product.price)}</TableCell>
                    <TableCell className="text-right">
                      {formatPrice(item.product.price * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <div className="flex justify-between text-muted-foreground mb-2">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground mb-4">
              <span>Frete</span>
              <span>Calculado no final</span>
            </div>
            <div className="flex justify-between font-serif text-2xl mb-8">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>

            <Button
              type="submit"
              form="checkout-form"
              className="w-full rounded-none h-14 uppercase tracking-widest text-lg"
            >
              Confirmar Pedido
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
