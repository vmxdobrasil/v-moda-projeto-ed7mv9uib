import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Database,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { fetchUnifiedLeads, type UnifiedLead } from '@/services/crm-data'
import { NewLeadDialog } from '@/components/crm/NewLeadDialog'
import { useCustomerExport } from '@/hooks/use-customer-export'
import { Progress } from '@/components/ui/progress'
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
  Interessado: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Qualificado: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Proposta: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'Em Negociação': 'bg-primary/20 text-primary border-primary/30',
  Convertido: 'bg-emerald/20 text-emerald border-emerald/30',
  Fechado: 'bg-emerald/20 text-emerald border-emerald/30',
  Recusado: 'bg-red-500/20 text-red-400 border-red-500/30',
  Inativo: 'bg-white/10 text-white/40 border-white/10',
}

const CUSTOMER_STATUS_OPTIONS = [
  { value: 'new', label: 'Novo' },
  { value: 'interested', label: 'Interessado' },
  { value: 'proposal', label: 'Proposta' },
  { value: 'negotiating', label: 'Em Negociação' },
  { value: 'converted', label: 'Convertido' },
  { value: 'closed', label: 'Fechado' },
  { value: 'inactive', label: 'Inativo' },
]

function getCustomerStatusLabel(status: string): string {
  const found = CUSTOMER_STATUS_OPTIONS.find((o) => o.value === status)
  return found?.label || status || 'Novo'
}

export default function CrmLeads() {
  const [leads, setLeads] = useState<UnifiedLead[]>([])
  const [totalLeads, setTotalLeads] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(50)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all') // 'all' | 'whatsapp' | 'manual'
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewLead, setShowNewLead] = useState(false)

  const {
    progress: exportProgress,
    exportLeads,
    isExporting,
    cancelExport,
    resetProgress,
  } = useCustomerExport()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const {
        items,
        totalItems,
        totalPages: pages,
      } = await fetchUnifiedLeads(page, perPage, {
        search,
        sourceFilter,
        statusFilter,
      })
      setLeads(items)
      setTotalLeads(totalItems)
      setTotalPages(pages || 1)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao carregar leads. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search, sourceFilter, statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('customers', loadData)

  const handleStatusChange = async (lead: UnifiedLead, newStatus: string) => {
    setUpdatingId(lead.id)
    try {
      await pb.collection('customers').update(lead.id, { status: newStatus })
      toast.success('Status atualizado com sucesso!')
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? { ...l, status: newStatus, statusLabel: getCustomerStatusLabel(newStatus) }
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

  const handleExportAll = async () => {
    const res = await exportLeads({
      search: search || '',
      source: sourceFilter !== 'all' ? sourceFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : '',
    })
    if (res.success) {
      toast.success(
        'Exportação da base de clientes concluída com sucesso! Verifique a página de Exportações.',
      )
    } else if (res.cancelled) {
      toast.info('Exportação cancelada.')
    } else if (res.error) {
      toast.error(res.error)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white flex items-center gap-2">
            Base de Leads CRM
          </h1>
          <p className="text-white/40 mt-1">
            Gestão unificada da base <code className="text-electric font-mono">customers</code>
            {totalLeads > 0 && ` · ${totalLeads.toLocaleString('pt-BR')} registros`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportAll}
            disabled={isExporting}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all shadow-sm"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2 text-electric" />
            )}
            Exportar Leads ({totalLeads.toLocaleString('pt-BR')})
          </Button>
          <Button
            onClick={() => setShowNewLead(true)}
            className="bg-electric hover:bg-electric/90 text-white transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Lead
          </Button>
        </div>
      </div>

      {/* Export Progress Bar */}
      {exportProgress.status === 'processing' && (
        <div className="crm-card p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>
              Exportando base de leads... ({exportProgress.processed.toLocaleString('pt-BR')} de{' '}
              {exportProgress.total > 0 ? exportProgress.total.toLocaleString('pt-BR') : '...'}{' '}
              processados)
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelExport}
              className="h-5 text-xs text-white/50 hover:text-white"
            >
              Cancelar
            </Button>
          </div>
          <Progress
            value={
              exportProgress.total > 0
                ? (exportProgress.processed / exportProgress.total) * 100
                : 50
            }
          />
        </div>
      )}

      {/* Export Done Notification */}
      {exportProgress.status === 'done' && (
        <div className="crm-card p-3 flex items-center justify-between text-xs bg-emerald-500/10 border-emerald-500/20 text-emerald-300">
          <span>Exportação salva com sucesso no histórico!</span>
          <div className="flex items-center gap-2">
            <Button asChild variant="link" size="sm" className="h-auto p-0 text-white underline">
              <Link to="/crm/exportacoes">Ver Arquivos</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetProgress}
              className="h-5 text-xs text-white/50"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/10 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <Input
            placeholder="Buscar por nome, telefone, cidade, estado..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Source filter: WhatsApp vs Manual vs All */}
          <Select
            value={sourceFilter}
            onValueChange={(v) => {
              setSourceFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white h-9 text-xs">
              <SelectValue placeholder="Fonte / Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Fontes</SelectItem>
              <SelectItem value="whatsapp">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp (~30k)
                </span>
              </SelectItem>
              <SelectItem value="manual">
                <span className="flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-azul" /> Manual / Catálogo (~322)
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="new">Novo</SelectItem>
              <SelectItem value="interested">Interessado</SelectItem>
              <SelectItem value="proposal">Proposta</SelectItem>
              <SelectItem value="negotiating">Em Negociação</SelectItem>
              <SelectItem value="converted">Convertido</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>

          {/* Per Page */}
          <Select
            value={String(perPage)}
            onValueChange={(v) => {
              setPerPage(Number(v))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[110px] bg-white/5 border-white/10 text-white h-9 text-xs">
              <SelectValue placeholder="Exibir" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 / pág</SelectItem>
              <SelectItem value="50">50 / pág</SelectItem>
              <SelectItem value="100">100 / pág</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="crm-card overflow-hidden">
        <div className="grid grid-cols-7 gap-4 px-6 py-3 border-b border-white/5 text-xs font-display uppercase tracking-wider text-white/40">
          <span>Empresa / Nome</span>
          <span>Telefone / Contato</span>
          <span>Grupo / Local</span>
          <span>Segmento</span>
          <span>Origem</span>
          <span>Status</span>
          <span>Data</span>
        </div>
        <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto crm-content-scroll">
          {loading ? (
            <div className="px-6 py-12 text-center text-white/30">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-electric" />
              Carregando leads da base customers...
            </div>
          ) : leads.length === 0 ? (
            <div className="px-6 py-12 text-center text-white/30">
              Nenhum lead encontrado com os filtros selecionados.
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={`${lead.collection}-${lead.id}`}
                className="grid grid-cols-7 gap-4 px-6 py-3 text-left transition-all duration-300 hover:bg-white/5"
              >
                <div className="truncate self-center">
                  <span className="text-sm font-medium text-white truncate block">
                    {lead.empresa}
                  </span>
                  {lead.email && (
                    <span className="text-xs text-white/40 truncate block">{lead.email}</span>
                  )}
                </div>
                <span className="text-sm text-white/80 font-mono truncate self-center">
                  {lead.contato || '—'}
                </span>
                <div className="truncate self-center text-xs text-white/60">
                  {lead.whatsapp_group_name ? (
                    <span className="text-emerald-400/90 truncate block">
                      {lead.whatsapp_group_name}
                    </span>
                  ) : null}
                  {lead.city || lead.state ? (
                    <span className="text-white/40 truncate block">
                      {[lead.city, lead.state].filter(Boolean).join(' - ')}
                    </span>
                  ) : !lead.whatsapp_group_name ? (
                    '—'
                  ) : null}
                </div>
                <span className="text-sm text-white/60 truncate self-center capitalize">
                  {lead.segmento?.replace(/_/g, ' ') || '—'}
                </span>
                <span className="text-xs text-white/70 truncate self-center">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] border',
                      lead.origem.includes('WhatsApp')
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : 'bg-azul/10 text-azul border-azul/20',
                    )}
                  >
                    {lead.origem}
                  </span>
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
                      {CUSTOMER_STATUS_OPTIONS.map((opt) => (
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 px-2">
        <p className="text-xs text-white/40">
          Mostrando {leads.length > 0 ? (page - 1) * perPage + 1 : 0} a{' '}
          {Math.min(page * perPage, totalLeads)} de {totalLeads.toLocaleString('pt-BR')} leads
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10 h-8 px-3 text-xs"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
          </Button>

          <span className="text-xs text-white/60 px-2">
            Página {page} de {Math.max(1, totalPages)}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10 h-8 px-3 text-xs"
          >
            Próxima <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <NewLeadDialog open={showNewLead} onOpenChange={setShowNewLead} onCreated={loadData} />
    </div>
  )
}
