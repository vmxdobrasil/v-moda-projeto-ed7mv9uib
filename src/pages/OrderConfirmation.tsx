import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Package, Truck, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSEO } from '@/hooks/useSEO'
import { formatPrice } from '@/lib/data'

export default function OrderConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const orderData = location.state

  useSEO({
    title: 'Pedido Realizado',
    description: 'Seu pedido foi realizado com sucesso.',
  })

  useEffect(() => {
    if (!orderData) {
      navigate('/')
    }
  }, [orderData, navigate])

  if (!orderData) return null

  const paymentMethodNames: Record<string, string> = {
    credit_card: 'Cartão de Crédito',
    pix: 'PIX',
    boleto: 'Boleto Bancário',
  }

  return (
    <div className="container py-24 md:py-32 min-h-[70vh]">
      <div className="max-w-3xl mx-auto bg-background border rounded-lg p-8 md:p-12 shadow-sm text-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl md:text-4xl font-serif mb-4">Pedido Realizado com Sucesso!</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Obrigado pela sua compra. O número do seu pedido é{' '}
          <strong className="text-foreground">{orderData.orderId}</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-10 p-6 bg-secondary/20 rounded-md">
          <div>
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Status</span>
            </div>
            <p className="font-medium">Processando</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Truck className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Frete</span>
            </div>
            <p className="font-medium">
              {orderData.shippingCost > 0 ? formatPrice(orderData.shippingCost) : 'Grátis'}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Pagamento</span>
            </div>
            <p className="font-medium">{paymentMethodNames[orderData.paymentMethod] || 'Cartão'}</p>
          </div>
        </div>

        <div className="border-t border-border pt-8 mb-8 text-left">
          <h2 className="font-serif text-xl mb-4">Resumo da Compra</h2>
          <div className="space-y-4 mb-6">
            {orderData.items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">{item.quantity}x</span>
                  <div className="flex flex-col">
                    <span>{item.product.name}</span>
                    {item.size && (
                      <span className="text-xs text-muted-foreground">Tamanho: {item.size}</span>
                    )}
                  </div>
                </div>
                <span className="font-medium">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-lg font-serif pt-4 border-t">
            <span>Total</span>
            <span className="text-primary">{formatPrice(orderData.total)}</span>
          </div>
        </div>

        {orderData.paymentMethod === 'pix' && (
          <div className="mb-10 p-6 border rounded-lg bg-secondary/10 flex flex-col items-center text-center w-full max-w-md mx-auto">
            <h3 className="font-serif text-lg mb-4">Pagamento via PIX</h3>
            <div className="w-48 h-48 bg-white flex items-center justify-center p-2 rounded-md border border-border mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=PIX_MOCK_PAYMENT_VMODA`}
                alt="QR Code PIX"
                className="w-full h-full object-contain mix-blend-multiply opacity-80"
              />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Escaneie o QR Code acima no aplicativo do seu banco para finalizar o pagamento.
            </p>
            <Button variant="outline" className="w-full">
              Copiar Código PIX
            </Button>
          </div>
        )}

        {orderData.paymentMethod === 'boleto' && (
          <div className="mb-10 p-6 border rounded-lg bg-secondary/10 flex flex-col items-center text-center w-full max-w-md mx-auto">
            <h3 className="font-serif text-lg mb-2">Boleto Bancário</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Seu boleto foi gerado com sucesso. Clique no botão abaixo para visualizá-lo ou
              imprimi-lo. O pedido será processado após a confirmação do pagamento.
            </p>
            <Button className="w-full sm:w-auto">Acessar Boleto</Button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="rounded-none h-12 px-8 uppercase tracking-widest">
            <Link to="/meus-pedidos">Ver Meus Pedidos</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-none h-12 px-8 uppercase tracking-widest"
          >
            <Link to="/colecoes">Continuar Comprando</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
