import { useState } from 'react'
import type { FunnelStage } from '@/services/crm-data'
import { cn } from '@/lib/utils'

const STAGE_COLORS = [
  'from-primary/30 to-primary/10',
  'from-electric/30 to-electric/10',
  'from-azul/30 to-azul/10',
]

export function CrmFunnel({ stages, loading }: { stages: FunnelStage[]; loading: boolean }) {
  const [weighted, setWeighted] = useState(false)

  const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const maxValue = Math.max(...stages.map((s) => (weighted ? s.weightedValue : s.totalValue)), 1)

  return (
    <div className="crm-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold font-display text-white">Funil de Vendas</h2>
        <div className="flex gap-1 p-1 rounded-full bg-white/5 border border-white/10">
          <button
            onClick={() => setWeighted(false)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-all duration-300',
              !weighted ? 'bg-primary text-white' : 'text-white/60 hover:text-white',
            )}
          >
            Total
          </button>
          <button
            onClick={() => setWeighted(true)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-all duration-300',
              weighted ? 'bg-primary text-white' : 'text-white/60 hover:text-white',
            )}
          >
            Ponderado
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {stages.map((stage, i) => {
          const value = weighted ? stage.weightedValue : stage.totalValue
          const widthPct = (value / maxValue) * 100
          return (
            <div key={stage.key} className="transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{stage.label}</span>
                  <span className="text-xs text-white/40">{stage.count} registros</span>
                </div>
                <span className="text-sm font-bold text-primary">
                  {loading ? '—' : formatBRL(value)}
                </span>
              </div>
              <div className="h-10 rounded-2xl bg-white/5 overflow-hidden border border-white/5">
                <div
                  className={cn(
                    'h-full rounded-2xl bg-gradient-to-r transition-all duration-500',
                    STAGE_COLORS[i] || STAGE_COLORS[0],
                  )}
                  style={{ width: `${Math.max(widthPct, 5)}%` }}
                />
              </div>
            </div>
          )
        })}
        {stages.length === 0 && !loading && (
          <p className="text-center text-white/30 py-8">Sem dados para exibir.</p>
        )}
      </div>
    </div>
  )
}
