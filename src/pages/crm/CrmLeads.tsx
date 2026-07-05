import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import useCrmStore from '@/stores/useCrmStore'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-white/5 text-white/60',
  contacted: 'bg-azul/20 text-azul',
  converted: 'bg-emerald/20 text-emerald',
  closed: 'bg-primary/20 text-primary',
}

export default function CrmLeads() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { setSelectedClient, selectedClient } = useCrmStore()

  const loadData = async () => {
    try {
      const data = await pb.collection('leads_venda').getFullList({
        sort: '-created',
        expand: 'retailer,manufacturer,brand',
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
        <h1 className="text-3xl font-bold font-display text-white">Leads</h1>
        <p className="text-white/40 mt-1">Gerencie seus leads de venda</p>
      </div>

      <div className="crm-card overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-white/5 text-xs font-display uppercase tracking-wider text-white/40">
          <span>Cliente</span>
          <span>Fabricante</span>
          <span>Status</span>
          <span>Data</span>
        </div>
        <div className="divide-y divide-white/5">
          {leads.map((lead) => {
            const clientName = lead.expand?.brand?.name || lead.expand?.retailer?.name || 'N/A'
            const mfrName =
              lead.expand?.manufacturer?.name || lead.expand?.manufacturer?.brand_name || 'N/A'
            const isSelected = selectedClient?.id === lead.id
            return (
              <button
                key={lead.id}
                onClick={() => setSelectedClient(lead.expand?.brand || lead)}
                className={cn(
                  'w-full grid grid-cols-4 gap-4 px-6 py-4 text-left transition-all duration-300 hover:bg-white/5',
                  isSelected && 'bg-primary/5',
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy to-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">{clientName.charAt(0)}</span>
                  </div>
                  <span className="text-sm text-white truncate">{clientName}</span>
                </div>
                <span className="text-sm text-white/60 self-center truncate">{mfrName}</span>
                <span
                  className={cn(
                    'text-[10px] px-2 py-1 rounded-full self-center justify-self-start',
                    STATUS_STYLES[lead.status] || 'bg-white/5 text-white/40',
                  )}
                >
                  {lead.status}
                </span>
                <span className="text-sm text-white/40 self-center">
                  {new Date(lead.created).toLocaleDateString('pt-BR')}
                </span>
              </button>
            )
          })}
          {!loading && leads.length === 0 && (
            <div className="px-6 py-12 text-center text-white/30">Nenhum lead encontrado.</div>
          )}
        </div>
      </div>
    </div>
  )
}
