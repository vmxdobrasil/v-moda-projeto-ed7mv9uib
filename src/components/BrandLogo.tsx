import { useBrand } from '@/hooks/use-brand'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  className?: string
  fallbackClassName?: string
  type?: 'v_moda_logo' | 'magazine_logo' | 'brand_logo'
  fallbackText?: string
}

export function BrandLogo({
  className,
  fallbackClassName,
  type = 'v_moda_logo',
  fallbackText = 'V Moda',
}: BrandLogoProps) {
  const { vModaLogo, magazineLogo, brandLogo } = useBrand()
  const logoUrl =
    type === 'brand_logo' ? brandLogo : type === 'v_moda_logo' ? vModaLogo : magazineLogo

  if (logoUrl) {
    return <img src={logoUrl} alt="Brand Logo" className={cn('object-contain', className)} />
  }

  return (
    <span className={cn('font-serif font-bold tracking-widest uppercase', fallbackClassName)}>
      {fallbackText}
    </span>
  )
}
