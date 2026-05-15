import { useState, useEffect, useRef } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, Filter, UploadCloud } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { format } from 'date-fns'
import ImportLeadsDialog from '@/pages/dashboard/components/ImportLeadsDialog'
import { Button } from '@/components/ui/button'

export default function DashboardCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalItems, setTotalItems] = useState(0)

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const [scrollTop, setScrollTop] = useState(0)
  const rowHeight = 72 // Adjusted for padding and content
  const containerHeight = 600

  const loadData = async (reset = false) => {
    if (loading && !reset) return
    setLoading(true)
    try {
      const filters: string[] = []
      if (search) {
        filters.push(`(name ~ "${search}" || phone ~ "${search}")`)
      }
      if (sourceFilter !== 'all') {
        filters.push(`source = "${sourceFilter}"`)
      }
      if (brandFilter) {
        filters.push(`whatsapp_group_name ~ "${brandFilter}"`)
      }

      const filterStr = filters.join(' && ')
      const currentPage = reset ? 1 : page

      const result = await pb.collection('customers').getList(currentPage, 250, {
        filter: filterStr,
        sort: '-created',
      })

      setCustomers((prev) => (reset ? result.items : [...prev, ...result.items]))
      setHasMore(result.page < result.totalPages)
      setTotalItems(result.totalItems)
      if (reset) setPage(2)
      else setPage((p) => p + 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadData(true)
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [search, sourceFilter, brandFilter])

  const pendingCreates = useRef<any[]>([])
  const updateTimeout = useRef<any>(null)

  useRealtime('customers', (e) => {
    if (e.action === 'create') {
      pendingCreates.current.push(e.record)
      if (!updateTimeout.current) {
        updateTimeout.current = setTimeout(() => {
          setCustomers((prev) => {
            const added = pendingCreates.current
            const newArray = [...added, ...prev]
            return newArray.slice(0, 35000) // Handle up to 35k in virtualized list
          })
          setTotalItems((prev) => prev + pendingCreates.current.length)
          pendingCreates.current = []
          updateTimeout.current = null
        }, 1000)
      }
    } else if (e.action === 'update') {
      setCustomers((prev) => prev.map((c) => (c.id === e.record.id ? e.record : c)))
    } else if (e.action === 'delete') {
      setCustomers((prev) => prev.filter((c) => c.id !== e.record.id))
      setTotalItems((prev) => Math.max(0, prev - 1))
    }
  })

  useEffect(() => {
    return () => {
      if (updateTimeout.current) clearTimeout(updateTimeout.current)
    }
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    setScrollTop(target.scrollTop)
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 400 && hasMore && !loading) {
      loadData()
    }
  }

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 5)
  const endIndex = Math.min(
    customers.length,
    Math.floor((scrollTop + containerHeight) / rowHeight) + 5,
  )
  const visibleItems = customers.slice(startIndex, endIndex)
  const offsetY = startIndex * rowHeight
  const totalHeight = customers.length * rowHeight

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads / Clientes</h1>
          <p className="text-muted-foreground">
            Gestão de leads com informações detalhadas de origem e marca.
          </p>
        </div>
        <Button onClick={() => setIsImportOpen(true)} className="gap-2">
          <UploadCloud className="w-4 h-4" />
          Importar Leads
        </Button>
      </div>

      <ImportLeadsDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportStateChange={setIsImporting}
        onImportComplete={loadData}
        subscription={{ plan_tier: 'enterprise', import_limit: 100000 }}
        customerCount={totalItems}
      />

      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>Refine a lista de clientes capturados.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full md:w-[250px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por Origem" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Origens</SelectItem>
              <SelectItem value="whatsapp_group">Grupos de WhatsApp</SelectItem>
              <SelectItem value="social_profile">Perfil Social (FB/IG)</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Filtrar por Loja/Marca..."
            className="w-full md:w-[250px]"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="overflow-hidden flex flex-col">
        <div className="flex bg-muted/50 border-b text-xs font-medium uppercase text-muted-foreground px-6 py-4">
          <div className="flex-[2] min-w-[200px]">Nome / Telefone</div>
          <div className="flex-[1] min-w-[150px]">Origem</div>
          <div className="flex-[1.5] min-w-[180px]">Origem (Loja/Marca)</div>
          <div className="w-[100px]">Status</div>
          <div className="w-[150px] text-right">Data Cadastro</div>
        </div>

        <CardContent className="p-0 flex-1 relative">
          {loading && customers.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
              Carregando leads...
            </div>
          ) : customers.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              Nenhum lead encontrado com os filtros atuais.
            </div>
          ) : (
            <div
              className="overflow-auto custom-scrollbar"
              style={{ height: `${containerHeight}px` }}
              onScroll={handleScroll}
            >
              <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
                <div
                  style={{
                    transform: `translateY(${offsetY}px)`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                  }}
                >
                  {visibleItems.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center px-6 border-b hover:bg-muted/50 transition-colors"
                      style={{ height: `${rowHeight}px` }}
                    >
                      <div className="flex-[2] min-w-[200px]">
                        <div className="font-semibold text-foreground truncate">
                          {c.name || 'Sem Nome'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {c.phone || 'Sem telefone'}
                        </div>
                      </div>
                      <div className="flex-[1] min-w-[150px]">
                        <Badge variant="outline" className="capitalize">
                          {(c.source || 'manual').replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex-[1.5] min-w-[180px] font-medium truncate pr-4">
                        {c.whatsapp_group_name ? (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 truncate max-w-full"
                          >
                            {c.whatsapp_group_name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </div>
                      <div className="w-[100px]">
                        <Badge variant={c.status === 'new' ? 'default' : 'secondary'}>
                          {c.status || 'new'}
                        </Badge>
                      </div>
                      <div className="w-[150px] text-muted-foreground text-sm text-right">
                        {c.created ? format(new Date(c.created), 'dd/MM/yyyy HH:mm') : '-'}
                      </div>
                    </div>
                  ))}
                  {loading && hasMore && (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="px-6 py-3 border-t bg-muted/20 text-xs text-muted-foreground font-medium">
            Total de registros processados na visualização: {totalItems}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
