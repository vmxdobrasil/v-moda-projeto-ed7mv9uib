import pb from '@/lib/pocketbase/client'

export interface Revendedora {
  id: string
  user: string
  name: string
  cpf: string
  whatsapp: string
  region: string
  city: string
  state: string
  tier: 'bronze' | 'prata' | 'ouro' | 'diamante'
  total_points: number
  monthly_points: number
  total_sales: number
  status: 'active' | 'inactive' | 'pending'
  source: 'mgm' | 'ads' | 'whatsapp_group' | 'direct'
  referrer: string
  created: string
  updated: string
}

export interface NivelRevenda {
  id: string
  name: 'bronze' | 'prata' | 'ouro' | 'diamante'
  min_points: number
  discount_percent: number
  benefits: string
  color: string
}

export const createRevendedora = (data: Partial<Revendedora>) =>
  pb.collection('revendedoras').create<Revendedora>(data)

export const getRevendedoraByUser = (userId: string) =>
  pb.collection('revendedoras').getFirstListItem<Revendedora>(`user = "${userId}"`)

export const updateRevendedora = (id: string, data: Partial<Revendedora>) =>
  pb.collection('revendedoras').update<Revendedora>(id, data)

export const getRevendedoras = () =>
  pb.collection('revendedoras').getFullList<Revendedora>({ sort: '-created' })

export const getNiveisRevenda = () =>
  pb.collection('niveis_revenda').getFullList<NivelRevenda>({ sort: 'min_points' })

export const getDownline = (revendedoraId: string) =>
  pb.collection('revendedoras').getFullList<Revendedora>({
    filter: `referrer = "${revendedoraId}"`,
    sort: '-created',
  })

export const getHistoricoPontos = (revendedoraId: string) =>
  pb.collection('historico_pontos_revenda').getFullList({
    filter: `revendedora = "${revendedoraId}"`,
    sort: '-created',
  })
