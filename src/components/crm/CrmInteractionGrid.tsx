import { MessageSquare, FileText } from 'lucide-react'
import type { Interaction } from '@/services/crm-data'

const CARD_STYLES = [
  'bg-navy border-white/10',
  'bg-teal-600 border-teal-400/20',
  'bg-black border-white/10',
  'bg-yellow-500 border-yellow-300/20',
  'crm-card',
  'crm-card',
]

export function CrmInteractionGrid({
  interactions,
  loading,
}: {
  interactions: Interaction[]
  loading: boolean
}) {
  const cards = [...interactions.slice(0, 6)]
  while (cards.length < 6) {
    cards.push({
      id: `empty-${cards.length}`,
      title: 'Sem atividade',
      subtitle: '',
      message: 'Nenhuma interação recente.',
      source: '',
      created: '',
    })
  }

  return (
    <div>
      <h2 className="text-lg font-bold font-display text-white mb-4">Histórico de Interações</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((interaction, i) => {
          const isGlass = i >= 4
          const Icon = interaction.source === 'customers' ? FileText : MessageSquare
          return (
            <div
              key={interaction.id}
              className={`rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 ${CARD_STYLES[i]}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${isGlass ? 'text-primary' : 'text-white/70'}`} />
                <span
                  className={`text-xs font-medium ${isGlass ? 'text-white/60' : 'text-white/80'}`}
                >
                  {interaction.title || 'Interação'}
                </span>
              </div>
              <p
                className={`text-sm mb-2 line-clamp-2 ${isGlass ? 'text-white/80' : 'text-white/90'}`}
              >
                {loading ? 'Carregando...' : interaction.message}
              </p>
              <p className={`text-xs ${isGlass ? 'text-white/40' : 'text-white/60'}`}>
                {interaction.subtitle}
                {interaction.created &&
                  ` · ${new Date(interaction.created).toLocaleDateString('pt-BR')}`}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
