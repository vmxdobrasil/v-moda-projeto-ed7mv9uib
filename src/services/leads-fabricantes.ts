import pb from '@/lib/pocketbase/client'

export interface LeadFabricante {
  id: string
  name: string
  category: string
  whatsapp: string
  email?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  status: 'pending' | 'contacted' | 'approved' | 'rejected'
  manufacturer?: string
  created: string
  updated: string
}

export const createLeadFabricante = (data: Partial<LeadFabricante>) =>
  pb.collection('leads_fabricantes').create<LeadFabricante>(data)

export const getLeadsFabricantes = () =>
  pb.collection('leads_fabricantes').getFullList<LeadFabricante>({ sort: '-created' })

export const updateLeadFabricante = (id: string, data: Partial<LeadFabricante>) =>
  pb.collection('leads_fabricantes').update<LeadFabricante>(id, data)

export const deleteLeadFabricante = (id: string) => pb.collection('leads_fabricantes').delete(id)
