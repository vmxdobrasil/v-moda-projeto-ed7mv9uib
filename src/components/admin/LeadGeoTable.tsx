import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Download, Loader2, Tag, X } from 'lucide-react'
import { getLeadsPaginated, exportLeads, type LeadFilters } from '@/services/leads-geographic'
import { extractDDD } from '@/lib/brazil-geo'

function useDebounce<T>(v: T, d: number): T {
  const [dv, setDv] = useState<T>(v)
  useEffect(() => {
    const h = setTimeout(() => setDv(v), d)
    return () => clearTimeout(h)
  }, [v, d])
  return dv
}

interface Props {
  filters: LeadFilters
  onFiltersChange: (f: LeadFilters) => void
}

export function LeadGeoTable({ filters, onFiltersChange }: Props) {
  const [data, setData] = useState<any>({ items: [], totalItems: 0, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage] = useState(25)
  const [search, setSearch] = useState(filters.search || '')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const activeFilters: LeadFilters = { ...filters, search: debouncedSearch }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getLeadsPaginated(page, perPage, activeFilters)
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, debouncedSearch, filters.ddd, filters.state, filters.city, filters.status])

  useEffect(() => {
    loadData()
  }, [loadData])
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filters.ddd, filters.state, filters.city, filters.status])
  useRealtime('customers', () => {
    loadData()
  })

  const toggleRow = (id: string, checked: boolean) => {
    const next = new Set(selectedIds)
    if (checked) next.add(id)
    else next.delete(id)
    setSelectedIds(next)
  }

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(data.items.map((i: any) => i.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportLeads(activeFilters, (done, total) => {
        setExportProgress(`${done.toLocaleString('pt-BR')} / ${total.toLocaleString('pt-BR')}`)
      })
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
      setExportProgress('')
    }
  }

  const clearFilters = () => {
    setSearch('')
    onFiltersChange({})
    setSelectedIds(new Set())
  }

  const hasActiveFilters = !!(debouncedSearch || filters.ddd || filters.state || filters.city)

  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] p-5 space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <Input
            placeholder="Buscar por nome, telefone, cidade..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {filters.ddd && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => onFiltersChange({ ...filters, ddd: '' })}
            >
              DDD {filters.ddd} <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          {filters.state && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => onFiltersChange({ ...filters, state: '' })}
            >
              {filters.state} <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white"
              onClick={clearFilters}
            >
              Limpar filtros
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {exportProgress}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" /> Exportar CSV
              </>
            )}
          </Button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-orange-600/10 border border-orange-600/30 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm text-white/80">{selectedIds.size} leads selecionados</span>
          <div className="flex gap-2">
            <Select
              onValueChange={(v) => {
                const ids = Array.from(selectedIds)
                ids.forEach((id) =>
                  import('@/lib/pocketbase/client').then(({ default: pb }) =>
                    pb.collection('customers').update(id, { status: v }),
                  ),
                )
                setSelectedIds(new Set())
              }}
            >
              <SelectTrigger className="h-8 w-[160px] bg-white/5 border-white/10 text-white rounded-lg">
                <SelectValue placeholder="Atualizar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Novo</SelectItem>
                <SelectItem value="interested">Interessado</SelectItem>
                <SelectItem value="negotiating">Em Negociação</SelectItem>
                <SelectItem value="converted">Convertido</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60"
              onClick={() => setSelectedIds(new Set())}
            >
              Limpar
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    data.items.length > 0 && data.items.every((i: any) => selectedIds.has(i.id))
                  }
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="text-white/60">Nome</TableHead>
              <TableHead className="text-white/60">Telefone</TableHead>
              <TableHead className="text-white/60">DDD</TableHead>
              <TableHead className="text-white/60">Cidade/UF</TableHead>
              <TableHead className="text-white/60">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-white/40">
                  <Loader2 className="w-6 h-6 mx-auto animate-spin" />
                </TableCell>
              </TableRow>
            ) : data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-white/40">
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((lead: any) => (
                <TableRow key={lead.id} className="border-white/5 hover:bg-white/5 cursor-pointer">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(lead.id)}
                      onCheckedChange={(c) => toggleRow(lead.id, c as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-white/90">
                    {lead.name || 'Sem nome'}
                  </TableCell>
                  <TableCell className="text-white/60 text-sm">{lead.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/20 text-white/70">
                      {lead.ddd || extractDDD(lead.phone || '') || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/60 text-sm">
                    {[lead.city, lead.state].filter(Boolean).join('/') || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {lead.status || 'N/A'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">
          {data.totalItems > 0
            ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, data.totalItems)} de ${data.totalItems.toLocaleString('pt-BR')}`
            : '0 leads'}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
            className="border-white/10 text-white/70 hover:bg-white/5 rounded-lg"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="border-white/10 text-white/70 hover:bg-white/5 rounded-lg"
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}
