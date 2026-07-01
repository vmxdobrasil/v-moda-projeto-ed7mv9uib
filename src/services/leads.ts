import pb from '@/lib/pocketbase/client'

export interface Lead {
  id: string
  retailer: string
  manufacturer: string
  brand?: string
  status: 'pending' | 'contacted' | 'converted' | 'closed'
  message?: string
  created: string
  updated: string
  expand?: {
    retailer?: { id: string; name: string; email: string; phone: string }
    brand?: { id: string; name: string }
  }
}

export const createLead = async (data: Partial<Lead>) => {
  return pb.collection('leads_venda').create<Lead>(data)
}

export const getManufacturerLeads = async (manufacturerId: string) => {
  return pb.collection('leads_venda').getFullList<Lead>({
    filter: `manufacturer = "${manufacturerId}"`,
    sort: '-created',
    expand: 'retailer,brand',
  })
}

export const updateLeadStatus = async (id: string, status: Lead['status']) => {
  return pb.collection('leads_venda').update<Lead>(id, { status })
}
