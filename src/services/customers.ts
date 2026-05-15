import pb from '@/lib/pocketbase/client'
import { normalizePhoneBR } from '@/lib/utils'

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
  instagram_handle?: string
  tags?: string[]
  freight_payer?: 'manufacturer' | 'retailer'
  logistics_notes?: string
  logistics_status?:
    | 'Aguardando Ônibus'
    | 'Em Trânsito no Ônibus'
    | 'Aguardando Envio'
    | 'Postado'
    | 'Em Trânsito'
    | 'Entregue'
  whatsapp_group_name?: string
  logistics_file?: string
  shipping_method?: 'transportadora' | 'correios' | 'caravana_onibus'
  tracking_code?: string
  shipping_date?: string
  expand?: {
    manufacturer?: {
      id: string
      name: string
      freight_commission_rate?: number
    }
  }
}

export const getCustomers = async () => {
  const user = pb.authStore.record
  if (!user) return []

  const isAdmin = user.email === 'valterpmendonca@gmail.com' || user.role === 'admin'
  const filter = isAdmin ? '' : `manufacturer = "${user.id}" || affiliate_referrer = "${user.id}"`

  return pb.collection('customers').getFullList<Customer>({
    filter,
    sort: '-created',
  })
}

export const getCustomersPaginated = async (page: number, limit: number, search?: string) => {
  const user = pb.authStore.record
  if (!user) return { items: [], totalItems: 0, totalPages: 0 }

  const isAdmin = user.email === 'valterpmendonca@gmail.com' || user.role === 'admin'
  let filter = isAdmin ? '' : `manufacturer = "${user.id}" || affiliate_referrer = "${user.id}"`

  if (search) {
    const searchFilter = `(name ~ "${search}" || phone ~ "${search}" || email ~ "${search}")`
    filter = filter ? `(${filter}) && ${searchFilter}` : searchFilter
  }

  return pb.collection('customers').getList<Customer>(page, limit, {
    filter,
    sort: '-created',
  })
}

export const getReferredCustomers = async () => {
  const user = pb.authStore.record
  if (!user) return []
  return pb.collection('customers').getFullList<Customer>({
    filter: `affiliate_referrer = "${user.id}"`,
    sort: '-created',
  })
}

export const createCustomer = async (data: Partial<Customer> | FormData) => {
  const user = pb.authStore.record
  if (data instanceof FormData) {
    const phone = data.get('phone') as string
    if (phone) {
      data.set('phone', normalizePhoneBR(phone))
    }
    if (user?.id) {
      if ((user.role === 'affiliate' || user.role === 'agent') && !data.has('affiliate_referrer')) {
        data.append('affiliate_referrer', user.id)
      } else if (user.role !== 'affiliate' && user.role !== 'agent' && !data.has('manufacturer')) {
        data.append('manufacturer', user.id)
      }
    }
  } else {
    if (data.phone) {
      data.phone = normalizePhoneBR(data.phone)
    }
    if (user?.id) {
      if (user.role === 'affiliate' || user.role === 'agent') {
        data.affiliate_referrer = user.id
      } else if (!data.manufacturer) {
        data.manufacturer = user.id
      }
    }
  }
  return pb.collection('customers').create<Customer>(data)
}

export const updateCustomer = async (id: string, data: Partial<Customer> | FormData) => {
  if (data instanceof FormData) {
    const phone = data.get('phone') as string
    if (phone) {
      data.set('phone', normalizePhoneBR(phone))
    }
  } else if (data.phone) {
    data.phone = normalizePhoneBR(data.phone)
  }
  return pb.collection('customers').update<Customer>(id, data)
}

export const deleteCustomer = async (id: string) => {
  return pb.collection('customers').delete(id)
}

export const bulkTagCustomers = async (data: {
  ids?: string[]
  excludedIds?: string[]
  filter?: string
  selectAll?: boolean
  tags: string[]
  operation?: 'add' | 'remove'
}) => {
  return pb.send('/backend/v1/customers/bulk-tag', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}
