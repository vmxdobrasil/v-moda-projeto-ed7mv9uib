import { useState, useEffect } from 'react'
import { getBrandSettings, type BrandSetting } from '@/services/brandSettings'
import { useRealtime } from './use-realtime'
import pb from '@/lib/pocketbase/client'

export function useBrand() {
  const [settings, setSettings] = useState<BrandSetting[]>([])

  const loadData = async () => {
    try {
      const data = await getBrandSettings()
      setSettings(data)
    } catch (e) {
      console.error('Failed to load brand settings', e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('brand_settings', () => {
    loadData()
  })

  const getLogoUrl = (key: string) => {
    const setting = settings.find((s) => s.key === key)
    if (setting && setting.value_file) {
      return pb.files.getURL(setting, setting.value_file)
    }
    return null
  }

  return {
    vModaLogo: getLogoUrl('v_moda_logo'),
    magazineLogo: getLogoUrl('magazine_logo'),
    brandLogo: getLogoUrl('brand_logo'),
    settings,
  }
}
