import pb from '@/lib/pocketbase/client'

export interface RetailerLead {
  id: string
  store_name: string
  contact_name: string
  cnpj: string
  phone: string
  email?: string
  city: string
  state: string
  fashion_hub?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  status: 'pending' | 'contacted' | 'approved' | 'rejected'
  created: string
  updated: string
}

export const createRetailerLead = (data: Partial<RetailerLead>) =>
  pb.collection('leads_retailers').create<RetailerLead>(data)

export const getRetailerLeads = () =>
  pb.collection('leads_retailers').getFullList<RetailerLead>({ sort: '-created' })

export const updateRetailerLead = (id: string, data: Partial<RetailerLead>) =>
  pb.collection('leads_retailers').update<RetailerLead>(id, data)

export const deleteRetailerLead = (id: string) => pb.collection('leads_retailers').delete(id)
