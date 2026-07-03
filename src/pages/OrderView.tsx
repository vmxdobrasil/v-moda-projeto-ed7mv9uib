import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { AsaasPaymentForm } from '@/components/payment/AsaasPaymentForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle2, ShoppingBag } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'

export default function OrderView() {
  const { id } = useParams()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (id) {
      pb.collection('orders')
        .getOne(id)
        .then(setOrder)
        .catch(() => {
          toast({
            title: 'Pedido não encontrado',
            description: 'Verifique se o link está correto.',
            variant: 'destructive',
          })
        })
    }
  }, [id, toast])

  async function checkPaymentStatus() {
    if (!order) return
    setIsChecking(true)
    try {
      const res = await pb.send(`/backend/v1/asaas/payments/${order.id}/status`, { method: 'GET' })
      if (res.status === 'RECEIVED' || res.status === 'CONFIRMED') {
        setOrder({ ...order, status: 'paid' })
        toast({ title: 'Tudo Certo!', description: 'Pagamento confirmado com sucesso.' })
      } else {
        toast({
          title: 'Status do Pagamento',
          description: `Situação atual na operadora: ${res.status}`,
        })
      }
    } catch (err: any) {
      toast({
        title: 'Aviso',
        description: err?.response?.message || 'Ainda não foi possível atualizar o status.',
        variant: 'destructive',
      })
    } finally {
      setIsChecking(false)
    }
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          <p className="text-muted-foreground">Localizando pedido...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up">
      <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 p-16 bg-primary/5 rounded-bl-full -z-10" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Resumo da Compra</p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Pedido <span className="opacity-50">#{order.id.slice(0, 8).toUpperCase()}</span>
            </h1>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={
                order.status === 'paid'
                  ? 'default'
                  : order.status === 'delivered'
                    ? 'secondary'
                    : 'outline'
              }
              className="text-sm px-3 py-1 bg-background shadow-sm"
            >
              {order.status === 'paid' && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
              {order.status === 'paid'
                ? 'Pagamento Confirmado'
                : order.status === 'delivered'
                  ? 'Entregue'
                  : 'Aguardando Pagamento'}
            </Badge>
            {order.status !== 'paid' && order.status !== 'delivered' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={checkPaymentStatus}
                disabled={isChecking}
                className="text-xs text-muted-foreground"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
                Atualizar Status
              </Button>
            )}
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-xl mb-8 flex justify-between items-center border">
          <span className="font-medium text-muted-foreground">Total a Pagar</span>
          <span className="text-2xl font-bold text-foreground">
            R$ {order.total_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {order.status === 'pending' && !paymentData && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Como você prefere pagar?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              A plataforma assegura o processamento rápido e protegido de todos os seus dados.
            </p>
            <AsaasPaymentForm
              orderId={order.id}
              amount={order.total_amount}
              onSuccess={setPaymentData}
            />
          </div>
        )}

        {order.is_pickup && order.pickup_qr_code && order.status === 'paid' && (
          <div className="mt-8 animate-fade-in">
            <Separator className="mb-8" />
            <div className="text-center space-y-6 max-w-sm mx-auto">
              <div>
                <h3 className="font-bold text-lg">QR Code de Retirada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Apresente este código na unidade de retirada.
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border shadow-sm mx-auto inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(order.pickup_qr_code)}&color=FF6600`}
                  alt="QR Code de Retirada"
                  className="w-48 h-48 md:w-56 md:h-56"
                />
              </div>
              <div className="bg-muted p-3 rounded-lg text-sm font-mono break-all text-center border select-all">
                {order.pickup_qr_code}
              </div>
              {order.expand?.pickup_partner_id && (
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.expand.pickup_partner_id.name}</p>
                  <p className="text-muted-foreground">{order.expand.pickup_partner_id.address}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.expand.pickup_partner_id.address || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#FF6600] hover:underline"
                  >
                    Ver no Mapa
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {paymentData && (
          <div className="mt-8 animate-fade-in">
            <Separator className="mb-8" />

            {paymentData.billingType === 'PIX' && paymentData.pixQrCode && (
              <div className="text-center space-y-6 max-w-sm mx-auto">
                <div>
                  <h3 className="font-bold text-lg">Pagamento via PIX</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Abra o app do seu banco e escaneie o código abaixo.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border shadow-sm mx-auto inline-block">
                  <img
                    src={`data:image/png;base64,${paymentData.pixQrCode.encodedImage}`}
                    alt="QR Code PIX"
                    className="w-48 h-48 md:w-56 md:h-56"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Ou utilize o código Copia e Cola:</p>
                  <div className="bg-muted p-3 rounded-lg text-xs font-mono break-all text-left border select-all focus:ring-2 outline-none">
                    {paymentData.pixQrCode.payload}
                  </div>
                </div>

                <Button
                  onClick={checkPaymentStatus}
                  disabled={isChecking}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                  Já realizei o pagamento
                </Button>
              </div>
            )}

            {paymentData.billingType === 'BOLETO' && (
              <div className="text-center space-y-6 max-w-sm mx-auto">
                <div>
                  <h3 className="font-bold text-lg">Boleto Bancário</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    O boleto foi gerado e está pronto para impressão ou pagamento online.
                  </p>
                </div>

                <Button asChild className="w-full h-12 text-base">
                  <a href={paymentData.bankSlipUrl} target="_blank" rel="noreferrer">
                    Visualizar Boleto
                  </a>
                </Button>

                <p className="text-xs text-muted-foreground">
                  A compensação pode levar até 2 dias úteis.
                </p>
              </div>
            )}

            {paymentData.billingType === 'CREDIT_CARD' && (
              <div className="text-center space-y-6 max-w-sm mx-auto">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
                <div>
                  <h3 className="font-bold text-lg">Fatura Gerada</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Utilize o link seguro abaixo para inserir os dados do seu cartão.
                  </p>
                </div>

                <Button asChild className="w-full h-12 text-base">
                  <a href={paymentData.invoiceUrl} target="_blank" rel="noreferrer">
                    Acessar Link de Pagamento
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
