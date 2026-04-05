import pb from '@/lib/pocketbase/client'

export interface BrandSetting {
  id: string
  name: string
  key: string
  value_file?: string
  value_text?: string
  created: string
  updated: string
}

export const getBrandSettings = async () => {
  return pb.collection('brand_settings').getFullList<BrandSetting>()
}

export const updateBrandSetting = async (id: string, data: FormData) => {
  return pb.collection('brand_settings').update<BrandSetting>(id, data)
}
