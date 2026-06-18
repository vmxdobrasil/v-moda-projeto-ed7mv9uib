import pb from '@/lib/pocketbase/client'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  status: string
  source: string
  manufacturer?: string
  whatsapp_group_name?: string
  whatsapp_welcome_sent?: boolean
  is_verified?: boolean
  created: string
  updated: string
  [key: string]: any
}

export const getCustomersPaginated = async (page: number, perPage: number, search?: string) => {
  const filter = search ? `(name ~ "${search}" || phone ~ "${search}" || email ~ "${search}")` : ''
  const result = await pb.collection('customers').getList<Customer>(page, perPage, {
    sort: '-updated',
    filter,
  })
  return {
    items: result.items,
    totalPages: result.totalPages,
    totalItems: result.totalItems,
  }
}

export const bulkTagCustomers = async (data: {
  tags: string[]
  selectAll?: boolean
  filter?: string
  excludedIds?: string[]
  ids?: string[]
}) => {
  return pb.send<{ updatedCount: number }>('/backend/v1/customers/bulk-tag', {
    method: 'POST',
    body: data,
  })
}

export const getCustomers = () =>
  pb.collection('customers').getFullList<Customer>({ sort: '-created' })
export const getCustomer = (id: string) => pb.collection('customers').getOne<Customer>(id)
export const createCustomer = (data: Partial<Customer>) =>
  pb.collection('customers').create<Customer>(data)
export const updateCustomer = (id: string, data: Partial<Customer>) =>
  pb.collection('customers').update<Customer>(id, data)
export const deleteCustomer = (id: string) => pb.collection('customers').delete(id)
