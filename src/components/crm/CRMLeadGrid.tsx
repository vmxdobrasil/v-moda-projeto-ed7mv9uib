import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { SendWhatsAppModal } from '@/components/crm/SendWhatsAppModal'
import { BulkReactivationModal } from '@/components/crm/BulkReactivationModal'
import { Checkbox } from '@/components/ui/checkbox'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Search,
  Loader2,
  MessageCircle,
  Eye,
  Calendar,
  MousePointerClick,
  FileText,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export function CRMLeadGrid({ adminView = false }: { adminView?: boolean }) {
  const { user } = useAuth()
  const [data, setData] = useState<any>({ items: [], totalItems: 0, totalPages: 0 })
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage] = useState(20)

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)

  const [statusFilter, setStatusFilter] = useState('all')
  const [shippingFilter, setShippingFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [inactivityFilter, setInactivityFilter] = useState('all')

  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [whatsappLead, setWhatsappLead] = useState<any>(null)
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAllMatching, setSelectAllMatching] = useState(false)
  const [waConfig, setWaConfig] = useState<any>(null)
  const [isReactivationModalOpen, setIsReactivationModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    pb.collection('categories')
      .getFullList({ sort: 'name' })
      .then(setCategories)
      .catch(console.error)

    pb.collection('whatsapp_configs')
      .getList(1, 1)
      .then((res) => {
        if (res.items.length > 0) setWaConfig(res.items[0])
      })
      .catch(() => setWaConfig(null))
  }, [])

  const isWaConnected = !!waConfig?.instance_id

  const buildFiltersString = useCallback(() => {
    const filters = []
    if (debouncedSearch) {
      filters.push(`(name ~ "${debouncedSearch}" || phone ~ "${debouncedSearch}")`)
    }
    if (statusFilter !== 'all') {
      filters.push(`status = "${statusFilter}"`)
    }
    if (shippingFilter !== 'all') {
      filters.push(`shipping_method = "${shippingFilter}"`)
    }
    if (categoryFilter !== 'all') {
      filters.push(`category_id = "${categoryFilter}"`)
    }
    if (inactivityFilter !== 'all') {
      const days = parseInt(inactivityFilter)
      const date = new Date()
      date.setDate(date.getDate() - days)
      const dateString = date.toISOString().replace('T', ' ').substring(0, 19) + 'Z'
      filters.push(`(last_contacted_at < "${dateString}" || last_contacted_at = "")`)
    }
    return filters.join(' && ')
  }, [debouncedSearch, statusFilter, shippingFilter, categoryFilter, inactivityFilter])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await pb.collection('customers').getList(page, perPage, {
        filter: buildFiltersString(),
        sort: '-created',
        expand: 'category_id',
      })
      setData(result)
    } catch (err: any) {
      console.error('Failed to load customers:', err)
      if (err?.status === 401 || err?.status === 403) {
        setError('Acesso negado. Você não tem permissão para visualizar estes dados.')
      } else if (err?.status === 0) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.')
      } else {
        setError('Não foi possível carregar os leads. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }, [page, perPage, buildFiltersString])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('customers', () => {
    loadData()
  })

  // Reset selections when filters change
  useEffect(() => {
    setSelectedIds(new Set())
    setSelectAllMatching(false)
  }, [debouncedSearch, statusFilter, shippingFilter, categoryFilter, inactivityFilter])

  const openDetails = (lead: any) => {
    setSelectedLead(lead)
    setIsDrawerOpen(true)
  }

  const openWhatsApp = (e: React.MouseEvent, lead: any) => {
    e.stopPropagation()
    setWhatsappLead(lead)
    setIsWhatsAppOpen(true)
  }

  const isAllCurrentPageSelected = useMemo(() => {
    return data.items.length > 0 && data.items.every((item: any) => selectedIds.has(item.id))
  }, [data.items, selectedIds])

  const handleSelectAllCurrentPage = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedIds)
      data.items.forEach((item: any) => newSelected.add(item.id))
      setSelectedIds(newSelected)
    } else {
      const newSelected = new Set(selectedIds)
      data.items.forEach((item: any) => newSelected.delete(item.id))
      setSelectedIds(newSelected)
      setSelectAllMatching(false)
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) newSelected.add(id)
    else {
      newSelected.delete(id)
      setSelectAllMatching(false)
    }
    setSelectedIds(newSelected)
  }

  const handleReactivationSuccess = () => {
    setSelectedIds(new Set())
    setSelectAllMatching(false)
    loadData()
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="new">Novo</SelectItem>
              <SelectItem value="interested">Interessado</SelectItem>
              <SelectItem value="negotiating">Em Negociação</SelectItem>
              <SelectItem value="converted">Convertido</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={shippingFilter}
            onValueChange={(v) => {
              setShippingFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Frete/Envio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Envios</SelectItem>
              <SelectItem value="transportadora">Transportadora</SelectItem>
              <SelectItem value="correios">Correios</SelectItem>
              <SelectItem value="caravana_onibus">Caravana Ônibus</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={inactivityFilter}
            onValueChange={(v) => {
              setInactivityFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Inatividade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer data</SelectItem>
              <SelectItem value="7">Mais de 7 dias</SelectItem>
              <SelectItem value="15">Mais de 15 dias</SelectItem>
              <SelectItem value="30">Mais de 30 dias</SelectItem>
              <SelectItem value="90">Mais de 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full lg:w-auto flex items-center justify-end text-xs whitespace-nowrap">
          {isWaConnected ? (
            <span className="flex items-center text-green-600">
              <CheckCircle2 className="w-4 h-4 mr-1" /> WA Conectado
            </span>
          ) : (
            <span className="flex items-center text-muted-foreground">
              <AlertCircle className="w-4 h-4 mr-1" /> WA Desconectado
              <Link to="/admin/configuracoes" className="ml-1 underline text-primary">
                Configurar
              </Link>
            </span>
          )}
        </div>
      </div>

      {(selectedIds.size > 0 || selectAllMatching) && (
        <div className="bg-primary/5 border border-primary/20 rounded-md p-3 flex flex-wrap gap-4 items-center justify-between animate-fade-in shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium">
              {selectAllMatching
                ? `Todos os ${data.totalItems} leads selecionados.`
                : `${selectedIds.size} leads selecionados.`}
            </span>
            {!selectAllMatching && data.totalItems > data.items.length && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setSelectAllMatching(true)}
                className="h-auto p-0"
              >
                Selecionar todos os {data.totalItems} leads desta busca
              </Button>
            )}
            {selectAllMatching && (
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setSelectedIds(new Set())
                  setSelectAllMatching(false)
                }}
                className="h-auto p-0 text-muted-foreground"
              >
                Limpar seleção
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsReactivationModalOpen(true)}
              disabled={!isWaConnected}
              title={!isWaConnected ? 'WhatsApp não conectado' : ''}
            >
              <Megaphone className="w-4 h-4 mr-2" /> Reativar Leads
            </Button>
          </div>
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center animate-fade-in">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-destructive" />
          <p className="text-sm text-destructive font-medium mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={() => loadData()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
          </Button>
        </div>
      ) : (
        <div className="rounded-md border bg-card relative min-h-[400px] shadow-sm">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-md">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={isAllCurrentPageSelected || selectAllMatching}
                    onCheckedChange={handleSelectAllCurrentPage}
                  />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Envio</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhum lead encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((lead: any) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                    onClick={() => openDetails(lead)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(lead.id) || selectAllMatching}
                        onCheckedChange={(checked) => handleSelectRow(lead.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{lead.name || 'Sem Nome'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{lead.phone || 'S/ Telefone'}</span>
                        <span className="text-xs text-muted-foreground">{lead.email || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{lead.expand?.category_id?.name || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          lead.status === 'converted'
                            ? 'default'
                            : lead.status === 'new'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {lead.status || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">
                        {lead.shipping_method?.replace('_', ' ') || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDetails(lead)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="default" size="icon" onClick={(e) => openWhatsApp(e, lead)}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Mostrando {data.totalItems > 0 ? (page - 1) * perPage + 1 : 0} a{' '}
          {Math.min(page * perPage, data.totalItems)} de {data.totalItems} leads.
        </div>
        <div className="flex items-center space-x-2">
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
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages || data.totalPages === 0 || loading}
          >
            Próximo
          </Button>
        </div>
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle>{selectedLead?.name}</DrawerTitle>
              <DrawerDescription>Detalhes e Histórico do Lead</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <Smartphone className="mr-2 h-4 w-4" /> Contato
                  </div>
                  <p className="text-sm">{selectedLead?.phone || 'Não informado'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" /> Último Contato
                  </div>
                  <p className="text-sm">
                    {selectedLead?.last_contacted_at
                      ? format(new Date(selectedLead.last_contacted_at), 'dd/MM/yyyy HH:mm')
                      : 'Nunca contatado'}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <MousePointerClick className="mr-2 h-4 w-4" /> Cliques WhatsApp
                  </div>
                  <p className="text-sm">{selectedLead?.whatsapp_clicks || 0} cliques</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <Badge variant="outline" className="mt-1">
                      {selectedLead?.status || 'Sem status'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <FileText className="mr-2 h-4 w-4" /> Notas
                </div>
                <div className="rounded-md bg-muted p-3 text-sm min-h-[80px]">
                  {selectedLead?.notes || 'Nenhuma nota registrada para este lead.'}
                </div>
              </div>
            </div>
            <DrawerFooter>
              <Button
                onClick={(e) => {
                  setIsDrawerOpen(false)
                  setTimeout(() => openWhatsApp(e as any, selectedLead), 300)
                }}
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Iniciar Conversa
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Fechar</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {whatsappLead && (
        <SendWhatsAppModal
          open={isWhatsAppOpen}
          onOpenChange={(open) => {
            setIsWhatsAppOpen(open)
            if (!open) setWhatsappLead(null)
          }}
          customer={whatsappLead}
        />
      )}

      <BulkReactivationModal
        open={isReactivationModalOpen}
        onOpenChange={setIsReactivationModalOpen}
        selectedIds={selectedIds}
        selectAllMatching={selectAllMatching}
        filterString={buildFiltersString()}
        onSuccess={handleReactivationSuccess}
      />
    </div>
  )
}
