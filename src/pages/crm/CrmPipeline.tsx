import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import useCrmStore from '@/stores/useCrmStore'
import { cn } from '@/lib/utils'

const COLUMNS = [
  { key: 'pending', label: 'Pendente', color: 'border-white/10' },
  { key: 'contacted', label: 'Contatado', color: 'border-azul/30' },
  { key: 'converted', label: 'Convertido', color: 'border-emerald/30' },
  { key: 'closed', label: 'Fechado', color: 'border-primary/30' },
]

export default function CrmPipeline() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { setSelectedClient, selectedClient } = useCrmStore()

  const loadData = async () => {
    try {
      const data = await pb.collection('leads_venda').getFullList({
        sort: '-created',
        expand: 'retailer,brand',
      })
      setLeads(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('leads_venda', loadData)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Pipeline</h1>
        <p className="text-white/40 mt-1">Acompanhe o fluxo de conversão de leads</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.key)
          return (
            <div key={col.key} className={cn('crm-card p-4 border-t-2', col.color)}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-display font-semibold text-white">{col.label}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                  {colLeads.length}
                </span>
              </div>
              <div className="space-y-2">
                {colLeads.map((lead) => {
                  const name = lead.expand?.brand?.name || lead.expand?.retailer?.name || 'N/A'
                  const isSelected = selectedClient?.id === lead.id
                  return (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedClient(lead.expand?.brand || lead)}
                      className={cn(
                        'w-full p-3 rounded-2xl bg-white/5 border border-white/5 text-left transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:border-primary/20',
                        isSelected && 'border-primary/40 bg-primary/5',
                      )}
                    >
                      <p className="text-sm font-medium text-white truncate">{name}</p>
                      <p className="text-xs text-white/40 mt-1">
                        {new Date(lead.created).toLocaleDateString('pt-BR')}
                      </p>
                    </button>
                  )
                })}
                {!loading && colLeads.length === 0 && (
                  <p className="text-center text-white/20 text-xs py-4">Vazio</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
