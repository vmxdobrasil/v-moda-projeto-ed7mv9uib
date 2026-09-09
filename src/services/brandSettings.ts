import pb from '@/lib/pocketbase/client'

export interface BrandSetting {
  id: string
  name: string
  key: string
  value_file: string
  value_text: string
  created: string
  updated: string
}

export const getBrandSettings = async () => {
  return pb.collection('brand_settings').getFullList<BrandSetting>({ sort: 'name' })
}

export const updateBrandSetting = async (id: string, data: FormData | Partial<BrandSetting>) => {
  return pb.collection('brand_settings').update<BrandSetting>(id, data)
}

export const getBrandSettingByKey = async (key: string): Promise<BrandSetting | null> => {
  try {
    return await pb.collection('brand_settings').getFirstListItem<BrandSetting>(`key = "${key}"`)
  } catch {
    return null
  }
}

export const saveBrandSettingValue = async (
  key: string,
  valueText: string,
  name?: string,
): Promise<BrandSetting> => {
  const existing = await getBrandSettingByKey(key)
  if (existing) {
    return pb.collection('brand_settings').update<BrandSetting>(existing.id, {
      value_text: valueText,
      ...(name ? { name } : {}),
    })
  }
  return pb.collection('brand_settings').create<BrandSetting>({
    key,
    name: name || key,
    value_text: valueText,
  })
}
