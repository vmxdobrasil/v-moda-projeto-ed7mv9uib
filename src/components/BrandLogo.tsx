import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'
import defaultLogoUrl from '@/assets/v_moda_brasil_horizontal_fiel-afff8.png'

interface BrandLogoProps {
  type: string
  fallbackText: string
  className?: string
  fallbackClassName?: string
}

export function BrandLogo({ type, fallbackText, className, fallbackClassName }: BrandLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchLogo = async () => {
      try {
        const record = await pb.collection('brand_settings').getFirstListItem(`key="${type}"`)
        if (isMounted && record && record.value_file) {
          setLogoUrl(pb.files.getURL(record, record.value_file))
        }
      } catch (e) {
        // Silently ignore errors (e.g. 404 if logo is not set yet)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchLogo()

    return () => {
      isMounted = false
    }
  }, [type])

  if (loading) {
    return (
      <div className={cn('animate-pulse bg-muted rounded min-w-[120px] min-h-[32px]', className)} />
    )
  }

  if (logoUrl) {
    return <img src={logoUrl} alt={fallbackText} className={cn('object-contain', className)} />
  }

  return <img src={defaultLogoUrl} alt={fallbackText} className={cn('object-contain', className)} />
}
