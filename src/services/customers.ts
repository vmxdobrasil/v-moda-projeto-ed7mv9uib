import pb from '@/lib/pocketbase/client'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  status: 'new' | 'interested' | 'negotiating' | 'converted' | 'inactive'
  manufacturer: string
  source: 'whatsapp' | 'instagram' | 'email' | 'manual'
  created: string
  updated: string
  exclusivity_zone?: string
  ranking_category?: string
  ranking_position?: number | null
  is_exclusive?: boolean
  unlocked_benefits?: Record<string, boolean> | null
}

export const getCustomers = async () => {
  return pb.collection('customers').getFullList<Customer>({
    sort: '-created',
  })
}

export const createCustomer = async (data: Partial<Customer> | FormData) => {
  if (data instanceof FormData) {
    if (pb.authStore.record?.id && !data.has('manufacturer')) {
      data.append('manufacturer', pb.authStore.record.id)
    }
  } else {
    if (pb.authStore.record?.id) {
      data.manufacturer = pb.authStore.record.id
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
