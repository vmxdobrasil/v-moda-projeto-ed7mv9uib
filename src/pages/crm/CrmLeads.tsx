import { useState, useEffect, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { fetchUnifiedLeads, type UnifiedLead } from '@/services/crm-data'
import { NewLeadDialog } from '@/components/crm/NewLeadDialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  Novo: 'bg-navy/30 text-white border-navy/50',
  'Em Negociação': 'bg-primary/20 text-primary border-primary/30',
  Convertido: 'bg-electric/20 text-electric border-electric/30',
  Recusado: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function CrmLeads() {
  const [leads, setLeads] = useState<UnifiedLead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNewLead, setShowNewLead] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await fetchUnifiedLeads()
      setLeads(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('leads_venda', loadData)
  useRealtime('leads_retailers', loadData)
  useRealtime('leads_fabricantes', loadData)

  const filtered = leads.filter(
    (l) =>
      !search ||
      l.empresa.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.contato.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Leads</h1>
          <p className="text-white/40 mt-1">Gerencie leads de todas as fontes</p>
        </div>
        <Button
          onClick={() => setShowNewLead(true)}
          className="bg-electric hover:bg-electric/90 text-white transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Lead
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
        <Input
          placeholder="Buscar leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
        />
      </div>

      <div className="crm-card overflow-hidden">
        <div className="grid grid-cols-7 gap-4 px-6 py-3 border-b border-white/5 text-xs font-display uppercase tracking-wider text-white/40">
          <span>Empresa</span>
          <span>Contato</span>
          <span>Email</span>
          <span>Segmento</span>
          <span>Origem</span>
          <span>Status</span>
          <span>Data</span>
        </div>
        <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto crm-content-scroll">
          {filtered.map((lead) => (
            <div
              key={`${lead.collection}-${lead.id}`}
              className="grid grid-cols-7 gap-4 px-6 py-3 text-left transition-all duration-300 hover:bg-white/5"
            >
              <span className="text-sm text-white truncate self-center">{lead.empresa}</span>
              <span className="text-sm text-white/60 truncate self-center">
                {lead.contato || '—'}
              </span>
              <span className="text-sm text-white/60 truncate self-center">
                {lead.email || '—'}
              </span>
              <span className="text-sm text-white/60 truncate self-center capitalize">
                {lead.segmento?.replace(/_/g, ' ') || '—'}
              </span>
              <span className="text-sm text-white/60 truncate self-center">
                {lead.origem || '—'}
              </span>
              <span
                className={cn(
                  'text-[10px] px-2 py-1 rounded-full border self-center justify-self-start whitespace-nowrap',
                  STATUS_STYLES[lead.statusLabel] || 'bg-white/5 text-white/40 border-white/10',
                )}
              >
                {lead.statusLabel}
              </span>
              <span className="text-sm text-white/40 self-center">
                {new Date(lead.data).toLocaleDateString('pt-BR')}
              </span>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-white/30">Nenhum lead encontrado.</div>
          )}
        </div>
      </div>

      <NewLeadDialog open={showNewLead} onOpenChange={setShowNewLead} onCreated={loadData} />
    </div>
  )
}
