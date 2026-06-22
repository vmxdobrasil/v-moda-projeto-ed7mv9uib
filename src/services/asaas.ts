import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export type BillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD'

export const createAsaasCharge = async (orderId: string, billingType: BillingType) => {
  try {
    const res = await pb.send('/backend/v1/asaas/charge', {
      method: 'POST',
      body: JSON.stringify({ orderId, billingType }),
      headers: { 'Content-Type': 'application/json' },
    })
    return { data: res, error: null }
  } catch (error: any) {
    const isNetworkOr5xx = error.status === 0 || error.status >= 500
    const message = isNetworkOr5xx
      ? 'O serviço de pagamentos está temporariamente indisponível. Por favor, aguarde alguns instantes e tente novamente.'
      : getErrorMessage(error) ||
        'Não foi possível gerar a cobrança no momento. Verifique os dados do pedido e tente novamente.'

    return { data: null, error: message }
  }
}

export const syncAsaasPayment = async (orderId: string) => {
  try {
    const res = await pb.send(`/backend/v1/asaas/sync/${orderId}`, {
      method: 'GET',
    })
    return { data: res, error: null }
  } catch (error: any) {
    return { data: null, error: getErrorMessage(error) }
  }
}
