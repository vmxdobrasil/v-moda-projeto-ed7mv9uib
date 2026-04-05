import pb from '@/lib/pocketbase/client'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  status: 'new' | 'interested' | 'negotiating' | 'converted' | 'inactive'
  manufacturer: string
  source:
    | 'whatsapp'
    | 'instagram'
    | 'email'
    | 'manual'
    | 'site'
    | 'whatsapp_group'
    | 'social_profile'
  created: string
  updated: string
  exclusivity_zone?: string
  ranking_category?: string
  ranking_position?: number | null
  is_exclusive?: boolean
  unlocked_benefits?: Record<string, boolean> | null
  is_verified?: boolean
  bio?: string
  whatsapp_clicks?: number
  freight_value?: number
  seat_number?: number
  active_route?: string
  notes?: string
  logistics_notes?: string
  logistics_status?: 'Aguardando Ônibus' | 'Em Trânsito no Ônibus' | 'Entregue'
}

export const getCustomers = async () => {
  return pb.collection('customers').getFullList<Customer>({
    sort: '-created',
  })
}

export const createCustomer = async (data: Partial<Customer> | FormData) => {
  const user = pb.authStore.record
  if (data instanceof FormData) {
    if (user?.id) {
      if (user.role === 'affiliate' && !data.has('affiliate_referrer')) {
        data.append('affiliate_referrer', user.id)
      } else if (user.role !== 'affiliate' && !data.has('manufacturer')) {
        data.append('manufacturer', user.id)
      }
    }
  } else {
    if (user?.id) {
      if (user.role === 'affiliate') {
        data.affiliate_referrer = user.id
      } else if (!data.manufacturer) {
        data.manufacturer = user.id
      }
    }
  }
  return pb.collection('customers').create<Customer>(data)
}

export const updateCustomer = async (id: string, data: Partial<Customer> | FormData) => {
  return pb.collection('customers').update<Customer>(id, data)
}

export const deleteCustomer = async (id: string) => {
  return pb.collection('customers').delete(id)
}
