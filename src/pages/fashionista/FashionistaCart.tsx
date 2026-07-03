import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import useCartStore from '@/stores/useCartStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { ClickCollectPanel } from '@/components/ClickCollectPanel'
import type { ExclusivePartner } from '@/services/exclusivity'
import { getOrderImageUrl } from '@/services/orders'

export default function FashionistaCart() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [brandMinimums, setBrandMinimums] = useState<Record<string, number>>({})
  const [pickupPartner, setPickupPartner] = useState<ExclusivePartner | null>(null)
  const [isPickup, setIsPickup] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    async function loadMinimums() {
      const manufacturerIds = [...new Set(items.map((i) => i.product.manufacturer).filter(Boolean))]
      const mins: Record<string, number> = {}
      for (const mfgId of manufacturerIds) {
        try {
          const rec = await pb.collection('users').getOne(mfgId)
          mins[mfgId] = rec.minimum_order || 0
        } catch {
          mins[mfgId] = 0
        }
      }
      setBrandMinimums(mins)
    }
    if (items.length > 0) loadMinimums()
  }, [items])

  const displayPrice = (product: any) => product.retail_price || product.price || 0
  const total = items.reduce((acc, item) => acc + displayPrice(item.product) * item.quantity, 0)
  const manufacturerIds = [...new Set(items.map((i) => i.product.manufacturer).filter(Boolean))]

  const itemsByBrand = items.reduce(
    (acc, item) => {
      const mfgId = item.product.manufacturer || 'unknown'
      if (!acc[mfgId]) acc[mfgId] = { items: [], totalQty: 0, name: '' }
      acc[mfgId].items.push(item)
      acc[mfgId].totalQty += item.quantity
      acc[mfgId].name =
        item.product.expand?.manufacturer?.brand_name ||
        item.product.expand?.manufacturer?.name ||
        'Marca'
      return acc
    },
    {} as Record<string, { items: typeof items; totalQty: number; name: string }>,
  )

  const unmetMinimums = Object.entries(itemsByBrand)
    .filter(([mfgId, group]) => {
      const min = brandMinimums[mfgId] || 0
      return min > 0 && group.totalQty < min
    })
    .map(([mfgId, group]) => ({
      brandName: group.name,
      required: brandMinimums[mfgId],
      current: group.totalQty,
      missing: brandMinimums[mfgId] - group.totalQty,
    }))

  const isPickupMandatory = !!pickupPartner
  const canCheckout = items.length > 0 && (isPickup || unmetMinimums.length === 0)

  const handlePickupChange = (pickup: boolean, partner: ExclusivePartner | null) => {
    setIsPickup(pickup)
    setPickupPartner(partner)
  }

  const handleCheckout = async () => {
    if (!canCheckout) {
      toast({
        variant: 'destructive',
        title: 'Requisitos não atingidos',
        description: 'Verifique o pedido mínimo ou use Click & Collect.',
      })
      return
    }
    setLoading(true)
    try {
      const orderData: any = {
        status: 'pending',
        total_amount: total,
        order_type: 'retail',
        payment_method: 'pix',
        seller_id: items[0]?.product.manufacturer,
        guest_name: user?.name || 'Fashionista',
        guest_phone: user?.phone || '',
        is_pickup: isPickup,
      }
      if (pickupPartner) orderData.pickup_partner_id = pickupPartner.id

      const order = await pb.collection('orders').create(orderData)
      for (const item of items) {
        await pb.collection('order_items').create({
          order_id: order.id,
          project_id: item.product.id,
          quantity: item.quantity,
          price_at_purchase: displayPrice(item.product),
          selected_size: item.size || '',
          selected_color: item.color || '',
        })
      }
      clearCart()
      toast({ title: 'Pedido criado!', description: `Pedido #${order.id.slice(0, 8)} criado.` })
      navigate(`/orders/view/${order.id}`)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err.message || 'Tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-display font-semibold mb-2">Sua sacola está vazia</h2>
          <p className="text-muted-foreground mb-6">Explore nosso catálogo e adicione produtos.</p>
          <Button asChild className="bg-[#FF6600] hover:bg-[#e65c00] text-white">
            <Link to="/fashionista/catalog">Explorar Catálogo</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/fashionista/catalog">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-display font-bold">Minha Sacola</h1>
        </div>
        <Button variant="ghost" onClick={() => clearCart()} className="text-muted-foreground">
          Limpar tudo
        </Button>
      </div>

      {!isPickup && unmetMinimums.length > 0 && (
        <div className="space-y-2 mb-6">
          {unmetMinimums.map((um, idx) => (
            <Alert key={idx} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Mínimo não atingido: {um.brandName}</AlertTitle>
              <AlertDescription>
                Faltam <strong>{um.missing}</strong> peça(s) para o mínimo de {um.required}. Use
                Click & Collect para retirar no local.
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="mb-6">
        <ClickCollectPanel manufacturerIds={manufacturerIds} onPickupChange={handlePickupChange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <img
                  src={getOrderImageUrl(item.product)}
                  alt={item.product.name}
                  className="w-16 h-20 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-1">{item.product.name}</h3>
                  <p className="text-primary font-bold text-sm">
                    R$ {displayPrice(item.product).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="w-16 p-1 border rounded text-center text-sm"
                    />
                    <span className="text-xs text-muted-foreground">peça(s)</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-navy">
                    R$ {(displayPrice(item.product) * item.quantity).toFixed(2)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Itens</span>
                <span>{items.length}</span>
              </div>
              {isPickup && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#FF6600] font-medium">Click & Collect</span>
                  <span className="text-[#FF6600]">Retirada no local</span>
                </div>
              )}
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-[#FF6600]">R$ {total.toFixed(2)}</span>
              </div>
              {canCheckout && (
                <div className="flex items-center gap-2 text-green-600 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isPickup ? 'Click & Collect ativado' : 'Pedido mínimo atingido'}</span>
                </div>
              )}
              <Button
                onClick={handleCheckout}
                disabled={!canCheckout || loading}
                className="w-full bg-[#FF6600] hover:bg-[#e65c00] text-white h-12 font-semibold"
              >
                {loading ? 'Processando...' : 'Finalizar Pedido'}
              </Button>
              {isPickupMandatory && (
                <p className="text-xs text-[#FF6600] text-center font-medium">
                  Retirada obrigatória na unidade exclusiva
                </p>
              )}
              {!canCheckout && !isPickupMandatory && (
                <p className="text-xs text-muted-foreground text-center">
                  Adicione mais peças ou use Click & Collect
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
