import pb from '@/lib/pocketbase/client'

export interface UnidadeLoja {
  id: string
  manufacturer: string
  name: string
  type: 'factory' | 'branch'
  address?: string
  phone?: string
  city?: string
  state?: string
  photos?: string[]
  manager?: string
  created: string
  updated: string
}

export const getUnidadesByManufacturer = (manufacturerId: string) =>
  pb.collection('unidades_lojas').getFullList<UnidadeLoja>({
    filter: `manufacturer = "${manufacturerId}"`,
    sort: 'name',
    expand: 'manager',
  })

export const createUnidade = (data: FormData) =>
  pb.collection('unidades_lojas').create<UnidadeLoja>(data)

export const updateUnidade = (id: string, data: FormData) =>
  pb.collection('unidades_lojas').update<UnidadeLoja>(id, data)

export const deleteUnidade = (id: string) => pb.collection('unidades_lojas').delete(id)
