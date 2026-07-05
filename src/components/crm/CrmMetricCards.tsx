import { DollarSign, Users, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react'
import type { CrmMetrics } from '@/services/crm-data'

const CARDS = [
  { key: 'valoresGanhos' as const, label: 'Valores Ganhos', icon: DollarSign, format: 'currency' },
  { key: 'novosClientes' as const, label: 'Novos Clientes', icon: Users, format: 'number' },
  {
    key: 'tarefasConcluidas' as const,
    label: 'Tarefas Concluídas',
    icon: CheckCircle,
    format: 'number',
  },
]

function formatValue(value: number, format: string): string {
  if (format === 'currency') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }
  return value.toString()
}

export function CrmMetricCards({
  metrics,
  loading,
}: {
  metrics: CrmMetrics | null
  loading: boolean
}) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {CARDS.map((card) => {
        const data = metrics?.[card.key] ?? { current: 0, previous: 0, variation: 0 }
        const Icon = card.icon
        const isUp = data.variation >= 0
        return (
          <div
            key={card.key}
            className="crm-card p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-electric/20 flex items-center justify-center border border-white/10">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 ${isUp ? 'bg-emerald/20 text-emerald' : 'bg-red-500/20 text-red-400'}`}
              >
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(data.variation)}%
              </div>
            </div>
            <p className="text-3xl font-bold font-display text-white">
              {loading ? '—' : formatValue(data.current, card.format)}
            </p>
            <p className="text-xs text-white/40 mt-1">{card.label}</p>
          </div>
        )
      })}
    </div>
  )
}
