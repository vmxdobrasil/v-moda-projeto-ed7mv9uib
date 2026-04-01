import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Copy, FileText, Truck, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import useAuthStore from '@/stores/useAuthStore'
import { useManufacturerStore } from '@/stores/useManufacturerStore'
import { useProductStore } from '@/stores/useProductStore'
import { formatPrice } from '@/lib/data'
import { useSEO } from '@/hooks/useSEO'
import { trackEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'

export default function Checkout() {
  const { items: cartItems, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const { manufacturers } = useManufacturerStore()
  const { products } = useProductStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [cep, setCep] = useState('')
  const [shippingCost, setShippingCost] = useState<number>(0)

  const isWholesale = user?.type === 'Atacado'

  const cartTotal = cartItems.reduce((acc, item) => {
    const currentProduct = products.find((p) => p.id === item.product.id) || item.product
    const price =
      isWholesale && currentProduct.wholesalePrice
        ? currentProduct.wholesalePrice
        : currentProduct.price
    return acc + price * item.quantity
  }, 0)

  // Group items by manufacturer for wholesale VMP logic
  const itemsByManufacturer = cartItems.reduce(
    (acc, item) => {
      const m = item.product.manufacturer || 'Outros'
      if (!acc[m]) acc[m] = { items: [], totalQuantity: 0 }
      acc[m].items.push(item)
      acc[m].totalQuantity += item.quantity
      return acc
    },
    {} as Record<string, { items: typeof cartItems; totalQuantity: number }>,
  )

  const vmpErrors: { manufacturer: string; required: number; current: number; missing: number }[] =
    []

  if (isWholesale) {
    Object.keys(itemsByManufacturer).forEach((mName) => {
      const manufacturer = manufacturers.find((m) => m.name === mName)
      if (manufacturer) {
        const { totalQuantity } = itemsByManufacturer[mName]
        if (totalQuantity < manufacturer.vmp) {
          vmpErrors.push({
            manufacturer: mName,
            required: manufacturer.vmp,
            current: totalQuantity,
            missing: manufacturer.vmp - totalQuantity,
          })
        }
      }
    })
  }

  const canCheckout = cartItems.length > 0 && vmpErrors.length === 0

  useSEO({
    title: 'Finalizar Compra',
    description: 'Finalize sua compra na V Moda com segurança e rapidez.',
  })

  useEffect(() => {
    if (cartItems.length > 0) {
      trackEvent('begin_checkout', {
        currency: 'BRL',
        value: cartTotal,
        items: cartItems.map((item) => ({
          item_id: item.product.id,
          item_name: item.product.name,
          price: item.product.price,
          currency: 'BRL',
          quantity: item.quantity,
        })),
      })
    }
  }, [cartItems, cartTotal])

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault()

    if (!canCheckout) {
      toast({
        title: 'Requisitos não atingidos',
        description: 'Verifique os avisos de quantidade mínima no seu carrinho.',
        variant: 'destructive',
      })
      return
    }

    const orderId = `PED-${Math.floor(Math.random() * 10000)}`

    if (isWholesale) {
      Object.keys(itemsByManufacturer).forEach((mName) => {
        const m = manufacturers.find((x) => x.name === mName)
        if (m) {
          toast({
            title: `E-mail enviado para o fabricante: ${mName}`,
            description: `Notificação do pedido ${orderId} com seus itens enviada com sucesso.`,
            variant: 'default',
          })
        }
      })
    }

    trackEvent('purchase', {
      transaction_id: orderId,
      currency: 'BRL',
      value: cartTotal + shippingCost,
      items: cartItems.map((item) => ({
        item_id: item.product.id,
        item_name: item.product.name,
        price: item.product.price,
        currency: 'BRL',
        quantity: item.quantity,
      })),
    })

    toast({
      title: 'Pedido confirmado',
      description: 'Obrigado pela sua compra! Em breve você receberá um e-mail com os detalhes.',
    })

    clearCart()
    navigate('/pedido-realizado', {
      state: {
        orderId,
        items: cartItems,
        total: cartTotal + shippingCost,
        shippingCost,
        paymentMethod,
      },
    })
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setCep(value)

    if (value.length === 8) {
      const mockCost = Math.random() > 0.5 ? 15.9 : 25.9
      setShippingCost(mockCost)
      toast({
        title: 'Frete calculado',
        description: `O valor do frete é ${formatPrice(mockCost)}.`,
      })
    } else {
      setShippingCost(0)
    }
  }

  const copyPixCode = () => {
    navigator.clipboard.writeText('00020126580014br.gov.bcb.pix0136...')
    toast({
      description: 'Código PIX copiado para a área de transferência!',
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
        {/* Formulário */}
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-medium mb-6 uppercase tracking-wider">
              Informações de Entrega
            </h2>
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input id="fullName" required placeholder="Seu nome completo" />
              </div>

              <div className="space-y-4 p-4 border rounded-md bg-secondary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Cálculo de Frete</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    placeholder="00000000"
                    maxLength={8}
                    value={cep}
                    onChange={handleCepChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite seu CEP para calcular opções de entrega.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input id="number" required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input id="complement" placeholder="Apto, Bloco, etc (opcional)" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" required />
              </div>
            </form>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-6 uppercase tracking-wider">
              Forma de Pagamento
            </h2>
            <div className="space-y-6">
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="credit_card" id="credit_card" className="peer sr-only" />
                  <Label
                    htmlFor="credit_card"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <span>Cartão de Crédito</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
                  <Label
                    htmlFor="pix"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                  >
                    <span>PIX</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="boleto" id="boleto" className="peer sr-only" />
                  <Label
                    htmlFor="boleto"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                  >
                    <span>Boleto</span>
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'credit_card' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 border p-6 rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="cc-number">Número do Cartão</Label>
                    <Input
                      id="cc-number"
                      placeholder="0000 0000 0000 0000"
                      form="checkout-form"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cc-name">Nome impresso no cartão</Label>
                    <Input
                      id="cc-name"
                      placeholder="NOME DO TITULAR"
                      form="checkout-form"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cc-exp">Validade</Label>
                      <Input id="cc-exp" placeholder="MM/AA" form="checkout-form" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cc-cvv">CVV</Label>
                      <Input id="cc-cvv" placeholder="123" form="checkout-form" required />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'pix' && (
                <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 border p-6 rounded-md text-center">
                  <div className="w-48 h-48 bg-muted flex items-center justify-center relative border border-border">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=PIX_MOCK_PAYMENT_VMODA`}
                      alt="QR Code PIX"
                      className="w-full h-full object-contain mix-blend-multiply opacity-80"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Escaneie o QR Code ou copie o código abaixo para pagar.
                  </p>
                  <Button type="button" variant="outline" onClick={copyPixCode} className="gap-2">
                    <Copy className="w-4 h-4" /> Copiar Código
                  </Button>
                </div>
              )}

              {paymentMethod === 'boleto' && (
                <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 border p-6 rounded-md text-center">
                  <FileText className="w-12 h-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    O boleto bancário será gerado e enviado para o seu e-mail após a confirmação do
                    pedido.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Resumo do Pedido */}
        <div className="bg-secondary/20 p-6 md:p-8 self-start sticky top-32">
          <h2 className="text-xl font-medium mb-6 uppercase tracking-wider">Resumo do Pedido</h2>

          {isWholesale && vmpErrors.length > 0 && (
            <div className="space-y-3 mb-6">
              {vmpErrors.map((error, idx) => (
                <Alert variant="destructive" key={idx}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Mínimo não atingido: {error.manufacturer}</AlertTitle>
                  <AlertDescription>
                    Faltam <strong>{error.missing}</strong> peças para atingir o VMP de{' '}
                    {error.required} peças.
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {isWholesale ? (
            <div className="space-y-4 mb-6">
              {Object.entries(itemsByManufacturer).map(([mName, group]) => {
                const mStore = manufacturers.find((m) => m.name === mName)
                const vmp = mStore?.vmp || 0
                const isVmpMet = group.totalQuantity >= vmp

                return (
                  <div
                    key={mName}
                    className="border rounded-md overflow-hidden bg-background shadow-sm"
                  >
                    <div className="bg-muted/50 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b">
                      <span className="font-semibold text-sm uppercase text-foreground">
                        {mName}
                      </span>
                      {vmp > 0 && (
                        <span
                          className={cn(
                            'text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap',
                            isVmpMet
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                              : 'bg-destructive/10 text-destructive',
                          )}
                        >
                          VMP: {vmp} peças (Você tem {group.totalQuantity})
                        </span>
                      )}
                    </div>
                    {mStore?.wholesaleMessage && (
                      <div className="px-4 py-2 bg-primary/10 text-primary text-xs font-medium border-b border-primary/20">
                        Aviso: {mStore.wholesaleMessage}
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableBody>
                          {group.items.map((item) => (
                            <TableRow key={`${item.product.id}-${item.size}`}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-10 h-14 object-cover hidden sm:block"
                                  />
                                  <div className="flex flex-col">
                                    <span className="line-clamp-2 text-sm">
                                      {item.product.name}
                                    </span>
                                    {item.size && (
                                      <span className="text-xs text-muted-foreground">
                                        Tam: {item.size}
                                      </span>
                                    )}
                                    {item.product.wholesalePrice && (
                                      <span className="text-[10px] text-accent font-medium uppercase tracking-wider mt-1">
                                        Atacado
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center text-sm">
                                {item.quantity}x
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {formatPrice(
                                  ((products.find((p) => p.id === item.product.id) || item.product)
                                    .wholesalePrice ||
                                    (products.find((p) => p.id === item.product.id) || item.product)
                                      .price) * item.quantity,
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="overflow-x-auto mb-6 border rounded-md bg-background shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={`${item.product.id}-${item.size}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-10 h-14 object-cover hidden sm:block"
                          />
                          <div className="flex flex-col">
                            <span className="line-clamp-2 text-sm">{item.product.name}</span>
                            {item.size && (
                              <span className="text-xs text-muted-foreground">
                                Tam: {item.size}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">{item.quantity}</TableCell>
                      <TableCell className="text-right text-sm">
                        {formatPrice(item.product.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="border-t border-border pt-4 mt-4">
            <div className="flex justify-between text-muted-foreground mb-2">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground mb-4">
              <span>Frete</span>
              <span>{shippingCost > 0 ? formatPrice(shippingCost) : 'Grátis'}</span>
            </div>
            <div className="flex justify-between font-serif text-2xl mb-8">
              <span>Total</span>
              <span className="text-primary">{formatPrice(cartTotal + shippingCost)}</span>
            </div>

            <Button
              type="submit"
              form="checkout-form"
              disabled={!canCheckout}
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
