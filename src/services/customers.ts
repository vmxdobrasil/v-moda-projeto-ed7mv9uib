import pb from '@/lib/pocketbase/client'

export const getCustomers = async (page = 1, perPage = 50, options = {}) => {
  return pb.collection('customers').getList(page, perPage, options)
}

export const getCustomer = async (id: string, options = {}) => {
  return pb.collection('customers').getOne(id, options)
}

export const createCustomer = async (data: any) => {
  return pb.collection('customers').create(data)
}

export const updateCustomer = async (id: string, data: any) => {
  return pb.collection('customers').update(id, data)
}

export const deleteCustomer = async (id: string) => {
  return pb.collection('customers').delete(id)
}

export type CustomerStatus =
  | 'lead'
  | 'contacted'
  | 'negotiation'
  | 'converted'
  | 'lost'
  | 'inactive'
  | 'active'
  | string

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  status?: CustomerStatus
  city?: string
  state?: string
  source?: string
  notes?: string
  tags?: string[]
  avatar?: string
  is_verified?: boolean
  ranking_category?: string
  price_level?: string
  rating_average?: number
  rating_count?: number
  exclusivity_zone?: string
  estimated_value?: number
  created?: string
  updated?: string
  expand?: any
  [key: string]: any
}

export const getReferredCustomers = async (userId: string, options = {}) => {
  return pb.collection('customers').getList(1, 200, {
    filter: `affiliate_referrer = "${userId}"`,
    sort: '-created',
    ...options,
  })
}

export interface BulkTagData {
  tags: string[]
  operation: 'add' | 'remove'
  ids?: string[]
  selectAll?: boolean
  filter?: string
  excludedIds?: string[]
}

export const bulkTagCustomers = async (data: BulkTagData) => {
  const res = await pb.send<{ updatedCount: number }>('/backend/v1/customers/bulk-tag', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res
}
