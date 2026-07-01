import pb from '@/lib/pocketbase/client'

export interface CargaTransporte {
  id: string
  agent: string
  excursion?: string
  customer?: string
  order?: string
  manufacturer?: string
  volume_count?: number
  weight_kg?: number
  description?: string
  pickup_address?: string
  delivery_status: 'pending' | 'collected' | 'in_transit' | 'delivered' | 'issue'
  qr_code_token?: string
  created: string
  updated: string
  expand?: any
}

export const getCargas = async (agentId?: string) => {
  const filter = agentId ? `agent = "${agentId}"` : ''
  return pb.collection('cargas_transporte').getFullList<CargaTransporte>({
    filter,
    sort: '-created',
    expand: 'agent,excursion,customer,manufacturer',
  })
}

export const createCarga = async (data: Partial<CargaTransporte>) => {
  return pb.collection('cargas_transporte').create<CargaTransporte>(data)
}

export const updateCarga = async (id: string, data: Partial<CargaTransporte>) => {
  return pb.collection('cargas_transporte').update<CargaTransporte>(id, data)
}

export const deleteCarga = async (id: string) => {
  return pb.collection('cargas_transporte').delete(id)
}

export const verifyDelivery = async (token: string) => {
  return pb.send('/backend/v1/delivery/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
    headers: { 'Content-Type': 'application/json' },
  })
}
