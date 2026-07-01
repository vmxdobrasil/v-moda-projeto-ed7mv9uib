import { cn } from '@/lib/utils'
import { Award, Crown, Medal, Star } from 'lucide-react'

const TIER_CONFIG: Record<string, { label: string; icon: any; color: string; ring: string }> = {
  bronze: {
    label: 'Bronze',
    icon: Medal,
    color: 'bg-amber-700 text-white',
    ring: 'ring-amber-700/30',
  },
  prata: { label: 'Prata', icon: Award, color: 'bg-gray-400 text-white', ring: 'ring-gray-400/30' },
  ouro: {
    label: 'Ouro',
    icon: Star,
    color: 'bg-yellow-500 text-white',
    ring: 'ring-yellow-500/30',
  },
  diamante: {
    label: 'Diamante',
    icon: Crown,
    color: 'bg-cyan-400 text-white',
    ring: 'ring-cyan-400/30',
  },
}

export function TierBadge({ tier, size = 'md' }: { tier: string; size?: 'sm' | 'md' | 'lg' }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.bronze
  const Icon = config.icon
  const sizeClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
        ? 'px-4 py-2 text-base'
        : 'px-3 py-1 text-sm'
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-bold ring-2',
        config.color,
        sizeClass,
        config.ring,
      )}
    >
      <Icon className={iconSize} />
      {config.label}
    </span>
  )
}
