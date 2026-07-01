import { Progress } from '@/components/ui/progress'
import { TierBadge } from './TierBadge'

const TIER_MIN: Record<string, number> = { bronze: 0, prata: 500, ouro: 1500, diamante: 5000 }

interface PointsProgressProps {
  currentPoints: number
  currentTier: string
  nextTier: string | null
  nextTierMinPoints: number
}

export function PointsProgress({
  currentPoints,
  currentTier,
  nextTier,
  nextTierMinPoints,
}: PointsProgressProps) {
  const currentTierMin = TIER_MIN[currentTier] ?? 0
  const range = nextTierMinPoints - currentTierMin
  const progress = nextTier
    ? Math.min(100, Math.max(0, ((currentPoints - currentTierMin) / range) * 100))
    : 100
  const remaining = Math.max(0, nextTierMinPoints - currentPoints)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <TierBadge tier={currentTier} size="lg" />
        {nextTier && (
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Próximo nível</p>
            <p className="text-xs text-muted-foreground capitalize">
              <span className="font-bold text-foreground">{nextTier}</span> — faltam{' '}
              {remaining.toLocaleString('pt-BR')} pts
            </p>
          </div>
        )}
      </div>
      <Progress value={progress} className="h-3" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="font-bold text-primary">{currentPoints.toLocaleString('pt-BR')} pts</span>
        {nextTier && <span>{nextTierMinPoints.toLocaleString('pt-BR')} pts</span>}
      </div>
    </div>
  )
}
