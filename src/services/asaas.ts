import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export type BillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD'

export interface CreditCardData {
  holderName: string
  number: string
  expiryMonth: string
  expiryYear: string
  ccv: string
}

export interface CustomerInfo {
  name: string
  email: string
  cpfCnpj: string
  cep: string
  addressNumber: string
  addressComplement: string
  phone: string
}

export const createAsaasCharge = async (
  orderId: string,
  billingType: BillingType,
  creditCard?: CreditCardData,
  customerInfo?: CustomerInfo,
) => {
  try {
    const res = await pb.send('/backend/v1/asaas/charge', {
      method: 'POST',
      body: JSON.stringify({ orderId, billingType, creditCard, customerInfo }),
      headers: { 'Content-Type': 'application/json' },
    })
    return { data: res, error: null }
  } catch (error: any) {
    const asaasErrors = error?.response?.data?.errors
    if (Array.isArray(asaasErrors) && asaasErrors.length > 0) {
      const messages = asaasErrors
        .map((e: any) => e.description || e.message)
        .filter(Boolean)
        .join(', ')
      if (messages) return { data: null, error: messages }
    }

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
