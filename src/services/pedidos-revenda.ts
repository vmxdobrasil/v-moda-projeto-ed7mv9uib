import pb from '@/lib/pocketbase/client'

export interface PedidoRevenda {
  id: string
  revendedora: string
  project: string
  type: 'wholesale' | 'dropshipping'
  quantity: number
  unit_price: number
  total_amount: number
  profit: number
  points_earned: number
  status: 'pending' | 'paid' | 'delivered' | 'canceled'
  client_name: string
  client_phone: string
  client_address: string
  share_link: string
  created: string
  updated: string
  expand?: {
    project?: any
    revendedora?: any
  }
}

export const createPedidoRevenda = (data: Partial<PedidoRevenda>) =>
  pb.collection('pedidos_revenda').create<PedidoRevenda>(data)

export const getPedidosByRevendedora = (revendedoraId: string) =>
  pb.collection('pedidos_revenda').getFullList<PedidoRevenda>({
    filter: `revendedora = "${revendedoraId}"`,
    sort: '-created',
    expand: 'project',
  })

export const updatePedidoRevenda = (id: string, data: Partial<PedidoRevenda>) =>
  pb.collection('pedidos_revenda').update<PedidoRevenda>(id, data)

export const getAllPedidosRevenda = () =>
  pb.collection('pedidos_revenda').getFullList<PedidoRevenda>({
    sort: '-created',
    expand: 'revendedora,project',
  })
