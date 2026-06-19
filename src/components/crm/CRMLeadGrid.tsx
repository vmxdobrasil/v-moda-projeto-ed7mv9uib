import { useState, useEffect, useCallback } from 'react'
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
import {
  Search,
  Loader2,
  MessageCircle,
  Eye,
  Calendar,
  MousePointerClick,
  FileText,
  Smartphone,
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

  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [whatsappLead, setWhatsappLead] = useState<any>(null)

  useEffect(() => {
    pb.collection('categories')
      .getFullList({ sort: 'name' })
      .then(setCategories)
      .catch(console.error)
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
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

      const result = await pb.collection('customers').getList(page, perPage, {
        filter: filters.join(' && '),
        sort: '-created',
        expand: 'category_id',
      })
      setData(result)
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, debouncedSearch, statusFilter, shippingFilter, categoryFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('customers', () => {
    loadData()
  })

  const openDetails = (lead: any) => {
    setSelectedLead(lead)
    setIsDrawerOpen(true)
  }

  const openWhatsApp = (e: React.MouseEvent, lead: any) => {
    e.stopPropagation()
    setWhatsappLead(lead)
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
        </div>
      </div>

      <div className="rounded-md border bg-card relative min-h-[400px] shadow-sm">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-md">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
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
          open={isWhatsAppOpen || !!whatsappLead}
          onOpenChange={(open) => {
            setIsWhatsAppOpen(open)
            if (!open) setWhatsappLead(null)
          }}
          customer={whatsappLead}
        />
      )}
    </div>
  )
}
