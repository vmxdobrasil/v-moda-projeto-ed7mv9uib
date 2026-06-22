import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { Loader2, CreditCard, QrCode, FileText } from 'lucide-react'

interface AsaasPaymentFormProps {
  orderId: string
  amount: number
  onSuccess?: (data: any) => void
}

export function AsaasPaymentForm({ orderId, amount, onSuccess }: AsaasPaymentFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handlePay(method: 'PIX' | 'BOLETO' | 'CREDIT_CARD') {
    setLoading(true)
    try {
      const res = await pb.send('/backend/v1/asaas/payments', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          method,
          externalReference: orderId,
          customerName: pb.authStore.record?.name || 'Cliente V Moda',
          customerEmail: pb.authStore.record?.email || 'contato@vmoda.com.br',
        }),
      })

      toast({
        title: 'Cobrança gerada com sucesso!',
        description: 'Siga as instruções para finalizar o pagamento.',
      })

      if (onSuccess) onSuccess(res)
    } catch (err: any) {
      // Clear, user-friendly error instead of technical raw logs
      const msg =
        err?.response?.message ||
        'Não foi possível conectar ao provedor de pagamento. Nossa equipe técnica já foi notificada. Tente novamente em instantes.'
      toast({
        title: 'Erro no Pagamento',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      <Button
        disabled={loading}
        onClick={() => handlePay('PIX')}
        className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-12"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-5 h-5" />}
        Pagar com PIX
      </Button>

      <Button
        disabled={loading}
        onClick={() => handlePay('BOLETO')}
        variant="outline"
        className="w-full justify-start gap-2 h-12"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-5 h-5" />}
        Pagar com Boleto
      </Button>

      <Button
        disabled={loading}
        onClick={() => handlePay('CREDIT_CARD')}
        variant="outline"
        className="w-full justify-start gap-2 h-12"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CreditCard className="w-5 h-5" />
        )}
        Cartão de Crédito
      </Button>
    </div>
  )
}
