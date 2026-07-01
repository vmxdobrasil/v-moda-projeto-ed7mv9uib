import pb from '@/lib/pocketbase/client'

export interface Excursao {
  id: string
  agent: string
  title: string
  departure_date: string
  return_date?: string
  origin_city: string
  destination_city: string
  origin_hub?: string
  destination_hub?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'canceled'
  notes?: string
  customers?: string[]
  created: string
  updated: string
  expand?: any
}

export const getExcursoes = async (agentId?: string) => {
  const filter = agentId ? `agent = "${agentId}"` : ''
  return pb.collection('excursoes').getFullList<Excursao>({
    filter,
    sort: '-departure_date',
    expand: 'agent,customers',
  })
}

export const createExcursao = async (data: Partial<Excursao>) => {
  return pb.collection('excursoes').create<Excursao>(data)
}

export const updateExcursao = async (id: string, data: Partial<Excursao>) => {
  return pb.collection('excursoes').update<Excursao>(id, data)
}

export const deleteExcursao = async (id: string) => {
  return pb.collection('excursoes').delete(id)
}
