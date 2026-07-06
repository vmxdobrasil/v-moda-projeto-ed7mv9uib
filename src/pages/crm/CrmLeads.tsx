import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { fetchUnifiedLeads, type UnifiedLead } from '@/services/crm-data'
import { NewLeadDialog } from '@/components/crm/NewLeadDialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  Novo: 'bg-azul/20 text-azul border-azul/30',
  'Em Negociação': 'bg-primary/20 text-primary border-primary/30',
  Convertido: 'bg-emerald/20 text-emerald border-emerald/30',
  Recusado: 'bg-red-500/20 text-red-400 border-red-500/30',
  Fechado: 'bg-primary/20 text-primary border-primary/30',
}

const STATUS_OPTIONS: Record<string, { value: string; label: string }[]> = {
  leads_venda: [
    { value: 'pending', label: 'Novo' },
    { value: 'contacted', label: 'Em Negociação' },
    { value: 'converted', label: 'Convertido' },
    { value: 'closed', label: 'Fechado' },
  ],
  leads_fabricantes: [
    { value: 'pending', label: 'Novo' },
    { value: 'contacted', label: 'Em Negociação' },
    { value: 'approved', label: 'Convertido' },
    { value: 'rejected', label: 'Recusado' },
  ],
  leads_retailers: [
    { value: 'pending', label: 'Novo' },
    { value: 'contacted', label: 'Em Negociação' },
    { value: 'approved', label: 'Convertido' },
    { value: 'rejected', label: 'Recusado' },
  ],
}

function getStatusLabel(status: string, collection: string): string {
  const options = STATUS_OPTIONS[collection] || []
  return options.find((o) => o.value === status)?.label || status
}

export default function CrmLeads() {
  const [leads, setLeads] = useState<UnifiedLead[]>([])
  const [totalLeads, setTotalLeads] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showNewLead, setShowNewLead] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const { items, totalItems } = await fetchUnifiedLeads(100)
      setLeads(items)
      setTotalLeads(totalItems)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao carregar leads. Tente novamente.')
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

  const handleStatusChange = async (lead: UnifiedLead, newStatus: string) => {
    setUpdatingId(lead.id)
    try {
      await pb.collection(lead.collection).update(lead.id, { status: newStatus })
      toast.success('Status atualizado com sucesso!')
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id && l.collection === lead.collection
            ? { ...l, status: newStatus, statusLabel: getStatusLabel(newStatus, lead.collection) }
            : l,
        ),
      )
    } catch (e) {
      console.error(e)
      toast.error('Erro ao atualizar status. Tente novamente.')
    } finally {
      setUpdatingId(null)
    }
  }

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
          <p className="text-white/40 mt-1">
            Gerencie leads de todas as fontes{totalLeads > 0 && ` · ${totalLeads} registros`}
          </p>
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
          {loading ? (
            <div className="px-6 py-12 text-center text-white/30">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Carregando leads...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-white/30">Nenhum lead encontrado.</div>
          ) : (
            filtered.map((lead) => (
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
                <span className="self-center">
                  <Select
                    value={lead.status}
                    onValueChange={(v) => handleStatusChange(lead, v)}
                    disabled={updatingId === lead.id}
                  >
                    <SelectTrigger
                      className={cn(
                        'h-7 w-[130px] text-[10px] font-medium border rounded-full',
                        STATUS_STYLES[lead.statusLabel] ||
                          'bg-white/5 text-white/40 border-white/10',
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(STATUS_OPTIONS[lead.collection] || []).map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </span>
                <span className="text-sm text-white/40 self-center">
                  {new Date(lead.data).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {totalLeads > leads.length && (
        <p className="text-xs text-white/30 text-center">
          Mostrando {leads.length} de {totalLeads} leads. Use a busca para filtrar.
        </p>
      )}

      <NewLeadDialog open={showNewLead} onOpenChange={setShowNewLead} onCreated={loadData} />
    </div>
  )
}
