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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Search,
  Filter,
  UploadCloud,
  CheckCheck,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Tag,
  X,
} from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import ImportLeadsDialog from '@/pages/dashboard/components/ImportLeadsDialog'
import { bulkTagCustomers } from '@/services/customers'
import { toast } from 'sonner'

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

  // Bulk Tagging State
  const [selectAll, setSelectAll] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set())
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [tagsInput, setTagsInput] = useState('')
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([])
  const [isTagging, setIsTagging] = useState(false)

  const [scrollTop, setScrollTop] = useState(0)
  const rowHeight = 72
  const containerHeight = 600

  const getActiveFilterStr = () => {
    const filters: string[] = []
    if (search) {
      filters.push(`(name ~ "${search}" || phone ~ "${search}" || email ~ "${search}")`)
    }
    if (sourceFilter !== 'all') {
      filters.push(`source = "${sourceFilter}"`)
    }
    if (brandFilter) {
      filters.push(`whatsapp_group_name ~ "${brandFilter}"`)
    }
    return filters.join(' && ')
  }

  const loadData = async (reset = false) => {
    if (loading && !reset) return
    setLoading(true)
    try {
      const filterStr = getActiveFilterStr()
      const currentPage = reset ? 1 : page

      const result = await pb.collection('customers').getList(currentPage, 250, {
        filter: filterStr,
        sort: '-created',
      })

      setCustomers((prev) => (reset ? result.items : [...prev, ...result.items]))
      setHasMore(result.page < result.totalPages)
      setTotalItems(result.totalItems)

      if (reset) {
        setSelectAll(false)
        setSelectedIds(new Set())
        setExcludedIds(new Set())
        setPage(2)
      } else {
        setPage((p) => p + 1)
      }
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
            return newArray.slice(0, 35000)
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

      // Update selections when deleted
      setSelectedIds((prev) => {
        if (!prev.has(e.record.id)) return prev
        const next = new Set(prev)
        next.delete(e.record.id)
        return next
      })
      setExcludedIds((prev) => {
        if (!prev.has(e.record.id)) return prev
        const next = new Set(prev)
        next.delete(e.record.id)
        return next
      })
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

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked)
    setSelectedIds(new Set())
    setExcludedIds(new Set())
  }

  const handleRowSelect = (id: string, checked: boolean) => {
    if (selectAll) {
      const newExcluded = new Set(excludedIds)
      if (checked) newExcluded.delete(id)
      else newExcluded.add(id)
      setExcludedIds(newExcluded)
    } else {
      const newSelected = new Set(selectedIds)
      if (checked) newSelected.add(id)
      else newSelected.delete(id)
      setSelectedIds(newSelected)
    }
  }

  const handleBulkTag = async () => {
    if (tagsToAdd.length === 0) return
    setIsTagging(true)
    try {
      const data: any = { tags: tagsToAdd, operation: 'add' }
      if (selectAll) {
        data.selectAll = true
        data.filter = getActiveFilterStr()
        data.excludedIds = Array.from(excludedIds)
      } else {
        data.ids = Array.from(selectedIds)
      }
      const res = await bulkTagCustomers(data)
      toast.success(`${res.updatedCount} clientes atualizados com sucesso!`)
      setIsTagDialogOpen(false)
      setTagsToAdd([])
      handleSelectAllChange(false)
      loadData(true)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aplicar tags.')
    } finally {
      setIsTagging(false)
    }
  }

  const selectedCount = selectAll ? totalItems - excludedIds.size : selectedIds.size

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

      <Card className="overflow-hidden flex flex-col relative">
        <div className="flex bg-muted/50 border-b text-xs font-medium uppercase text-muted-foreground px-6 py-4 items-center">
          <div className="w-[40px] pr-2">
            <Checkbox
              checked={
                selectAll
                  ? excludedIds.size === 0
                    ? true
                    : 'indeterminate'
                  : selectedIds.size === totalItems && totalItems > 0
                    ? true
                    : selectedIds.size > 0
                      ? 'indeterminate'
                      : false
              }
              onCheckedChange={(checked) => handleSelectAllChange(checked === true)}
            />
          </div>
          <div className="flex-[2] min-w-[200px]">Nome / Telefone</div>
          <div className="flex-[1] min-w-[150px]">Origem</div>
          <div className="flex-[1.5] min-w-[180px]">Tags / Marca</div>
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
                      <div
                        className="w-[40px] pr-2 flex items-center h-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectAll ? !excludedIds.has(c.id) : selectedIds.has(c.id)}
                          onCheckedChange={(checked) => handleRowSelect(c.id, checked === true)}
                        />
                      </div>
                      <div className="flex-[2] min-w-[200px]">
                        <div className="font-semibold text-foreground truncate flex items-center gap-1.5">
                          {c.name &&
                          String(c.name).toUpperCase() !== 'FALSE' &&
                          String(c.name).toUpperCase() !== 'TRUE'
                            ? c.name
                            : 'Sem Nome'}
                          {c.is_verified ? (
                            <ShieldCheck
                              className="w-3.5 h-3.5 text-green-500"
                              title="Verificado"
                            />
                          ) : (
                            <ShieldAlert
                              className="w-3.5 h-3.5 text-muted-foreground/50"
                              title="Não verificado"
                            />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-1.5">
                          <span>{c.phone || 'Sem telefone'}</span>
                          {c.phone && (
                            <span
                              className={cn(
                                'flex items-center gap-1 text-[10px]',
                                c.whatsapp_welcome_sent ? 'text-green-600' : 'text-amber-600',
                              )}
                              title={
                                c.whatsapp_welcome_sent
                                  ? 'Boas-vindas enviada'
                                  : 'Mensagem pendente'
                              }
                            >
                              {c.whatsapp_welcome_sent ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-[1] min-w-[150px]">
                        <Badge variant="outline" className="capitalize">
                          {(c.source || 'manual').replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex-[1.5] min-w-[180px] font-medium truncate pr-4 flex flex-col gap-1 justify-center h-full">
                        {c.whatsapp_group_name && (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 truncate max-w-[fit-content] text-[10px] py-0 h-4"
                          >
                            {c.whatsapp_group_name}
                          </Badge>
                        )}
                        {c.tags && c.tags.length > 0 && (
                          <div className="flex gap-1 overflow-hidden">
                            {c.tags.slice(0, 2).map((t: string) => (
                              <Badge
                                key={t}
                                variant="outline"
                                className="text-[9px] py-0 h-4 truncate font-normal"
                              >
                                {t}
                              </Badge>
                            ))}
                            {c.tags.length > 2 && (
                              <Badge variant="outline" className="text-[9px] py-0 h-4 font-normal">
                                +{c.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                        {!c.whatsapp_group_name && (!c.tags || c.tags.length === 0) && (
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

      {/* Floating Action Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 animate-slide-up">
          <div className="flex items-center gap-2 font-medium">
            <Badge
              variant="secondary"
              className="bg-background text-foreground hover:bg-background"
            >
              {selectedCount}
            </Badge>
            <span className="text-sm">selecionados</span>
          </div>
          <div className="w-px h-6 bg-border/20 mx-2" />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsTagDialogOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground border-none shadow-sm"
          >
            <Tag className="w-4 h-4 mr-2" /> Categorizar em Grupo
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-background hover:bg-background/20 rounded-full h-8 w-8 ml-2"
            onClick={() => handleSelectAllChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Tagging Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categorizar em Grupo</DialogTitle>
            <DialogDescription>
              Adicione tags para os {selectedCount} leads selecionados. Estas tags ajudarão na
              segmentação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex flex-wrap gap-2 min-h-[2rem]">
              {tagsToAdd.length === 0 && (
                <span className="text-sm text-muted-foreground italic">
                  Nenhuma tag adicionada...
                </span>
              )}
              {tagsToAdd.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="pl-2 pr-1 py-1 flex items-center gap-1"
                >
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100"
                    onClick={() => setTagsToAdd((prev) => prev.filter((t) => t !== tag))}
                  />
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Digite a tag e pressione Enter..."
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagsInput.trim()) {
                  e.preventDefault()
                  if (!tagsToAdd.includes(tagsInput.trim())) {
                    setTagsToAdd([...tagsToAdd, tagsInput.trim()])
                  }
                  setTagsInput('')
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTagDialogOpen(false)}
              disabled={isTagging}
            >
              Cancelar
            </Button>
            <Button disabled={tagsToAdd.length === 0 || isTagging} onClick={handleBulkTag}>
              {isTagging ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Aplicar Tags'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
