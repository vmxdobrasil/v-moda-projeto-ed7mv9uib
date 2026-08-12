import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { fetchLeads, type LeadCollection, type UnifiedLead } from '@/services/unified-leads'
import { LeadsTable } from '@/components/leads/LeadsTable'
import { ImportLeadsDialog } from '@/components/leads/ImportLeadsDialog'
import { useLeadsExport } from '@/hooks/use-leads-export'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Search,
  Download,
  Upload,
  Loader2,
  ShieldAlert,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

const PER_PAGE = 25
const ALL_COLLECTIONS: LeadCollection[] = ['leads_venda', 'leads_fabricantes', 'leads_retailers']
const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'contacted', label: 'Contatado' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'rejected', label: 'Rejeitado' },
  { value: 'converted', label: 'Convertido' },
  { value: 'closed', label: 'Fechado' },
]

export default function LeadsDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'all' | LeadCollection>('all')
  const [items, setItems] = useState<UnifiedLead[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [showImport, setShowImport] = useState(false)
  const { progress, exportLeads, cancelExport, isExporting, resetProgress } = useLeadsExport()

  const allowedRoles = ['admin', 'manufacturer', 'retailer']
  const canAccess = !user || allowedRoles.includes(user.role)
  const isAdmin = user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com'

  const fetchIdRef = useRef(0)
  const loadingRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const loadData = useCallback(async () => {
    if (!canAccess) {
      setLoading(false)
      return
    }
    const fetchId = ++fetchIdRef.current
    loadingRef.current = true
    setLoading(true)
    setLoadError(null)

    const timeoutId = setTimeout(() => {
      if (fetchId === fetchIdRef.current) {
        loadingRef.current = false
        setLoading(false)
        setLoadError('O carregamento demorou demais. Tente novamente.')
      }
    }, 30_000)

    try {
      const result = await fetchLeads(tab, page, PER_PAGE, {
        search: debouncedSearch || undefined,
        status: statusFilter,
        source: sourceFilter,
      })
      if (fetchId !== fetchIdRef.current) return
      setItems(result.items)
      setTotalItems(result.totalItems)
      setTotalPages(result.totalPages)
    } catch (err) {
      if (fetchId !== fetchIdRef.current) return
      console.error(err)
      setLoadError('Não foi possível carregar os leads. Verifique sua conexão e tente novamente.')
    } finally {
      clearTimeout(timeoutId)
      if (fetchId === fetchIdRef.current) {
        loadingRef.current = false
        setLoading(false)
      }
    }
  }, [tab, page, debouncedSearch, statusFilter, sourceFilter, canAccess])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('leads_venda', () => {
    if (!loadingRef.current) loadData()
  })
  useRealtime('leads_fabricantes', () => {
    if (!loadingRef.current) loadData()
  })
  useRealtime('leads_retailers', () => {
    if (!loadingRef.current) loadData()
  })

  const handleRetry = useCallback(() => {
    loadingRef.current = false
    loadData()
  }, [loadData])

  const handleExport = async () => {
    const cols = tab === 'all' ? ALL_COLLECTIONS : [tab]
    const result = await exportLeads(cols, {
      search: debouncedSearch || undefined,
      status: statusFilter,
      source: sourceFilter,
    })
    if (result.success) toast.success('Exportação concluída!')
    else if (result.cancelled) toast.info('Exportação cancelada.')
    else if (result.error) toast.error(result.error)
  }

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">403 - Acesso Negado</h2>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Gerencie leads de todas as fontes{totalItems > 0 && ` · ${totalItems} registros`}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="outline" onClick={() => setShowImport(true)}>
              <Upload className="w-4 h-4 mr-2" /> Importar CSV
            </Button>
          )}
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}{' '}
            Exportar
          </Button>
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as any)
          setPage(1)
        }}
      >
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="leads_venda">Vendas</TabsTrigger>
          <TabsTrigger value="leads_fabricantes">Fabricantes</TabsTrigger>
          <TabsTrigger value="leads_retailers">Retailers</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sourceFilter}
          onValueChange={(v) => {
            setSourceFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Origens</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="google">Google</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={handleRetry}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loadError && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-md p-6 flex flex-col items-center gap-3">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="text-sm text-destructive text-center max-w-md">{loadError}</p>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
          </Button>
        </div>
      )}

      {progress.status === 'processing' && (
        <div className="bg-primary/5 border border-primary/20 rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Exportando... Lote {progress.currentBatch}</span>
            <span>
              {progress.total > 0
                ? `${Math.round((progress.processed / progress.total) * 100)}%`
                : '0%'}
            </span>
          </div>
          <Progress value={progress.total > 0 ? (progress.processed / progress.total) * 100 : 0} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {progress.processed} de {progress.total} processados
            </span>
            <Button variant="ghost" size="sm" onClick={cancelExport} className="h-6 text-xs">
              Cancelar
            </Button>
          </div>
        </div>
      )}
      {progress.status === 'error' && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-md p-3">
          <p className="text-sm text-destructive">{progress.error}</p>
          <Button size="sm" variant="outline" onClick={resetProgress} className="mt-2">
            Fechar
          </Button>
        </div>
      )}
      {progress.status === 'done' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-sm text-green-700">
            Exportação concluída! {progress.total} registros exportados.
          </p>
          <Button size="sm" variant="outline" onClick={resetProgress} className="mt-2">
            Fechar
          </Button>
        </div>
      )}

      {!loadError && <LeadsTable items={items} loading={loading} />}

      {!loadError && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {totalItems > 0
              ? `${(page - 1) * PER_PAGE + 1}-${Math.min(page * PER_PAGE, totalItems)} de ${totalItems}`
              : '0 registros'}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

      <ImportLeadsDialog open={showImport} onOpenChange={setShowImport} onImported={handleRetry} />
    </div>
  )
}
