import pb from '@/lib/pocketbase/client'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  status: 'new' | 'interested' | 'negotiating' | 'converted' | 'inactive'
  manufacturer: string
  source: 'whatsapp' | 'instagram' | 'email' | 'manual'
  created: string
  updated: string
}

export const getCustomers = async () => {
  return pb.collection('customers').getFullList<Customer>({
    sort: '-created',
  })
}

export const createCustomer = async (data: Partial<Customer>) => {
  if (pb.authStore.record?.id) {
    data.manufacturer = pb.authStore.record.id
  }
  return pb.collection('customers').create<Customer>(data)
}

export const updateCustomer = async (id: string, data: Partial<Customer>) => {
  return pb.collection('customers').update<Customer>(id, data)
}

export const deleteCustomer = async (id: string) => {
  return pb.collection('customers').delete(id)
}
