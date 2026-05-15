import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/use-realtime'
import { getCustomersPaginated, Customer } from '@/services/customers'
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  CheckCheck,
  Clock,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [isNormalizing, setIsNormalizing] = useState(false)
  const [normalizeProgress, setNormalizeProgress] = useState<{
    processed: number
    total: number
  } | null>(null)

  const debouncedSearch = useDebounce(search, 500)

  const handleNormalize = async () => {
    try {
      setIsNormalizing(true)
      toast.loading('Normalizando números de telefone...')
      const res = await pb.send('/backend/v1/customers/normalize', { method: 'POST' })
      toast.dismiss()
      toast.success(`${res.count} números foram normalizados com sucesso.`)
      loadData()
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Erro ao normalizar números')
    } finally {
      setIsNormalizing(false)
    }
  }

  useRealtime('import_logs', (e) => {
    if (e.action === 'create' || e.action === 'update') {
      const record = e.record
      if (record.filename === 'Normalização de Contatos' && record.status === 'processing') {
        setIsNormalizing(true)
        setNormalizeProgress({ processed: record.processed_records, total: record.total_records })
      } else if (record.filename === 'Normalização de Contatos' && record.status === 'success') {
        setIsNormalizing(false)
        setNormalizeProgress(null)
      }
    }
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getCustomersPaginated(page, 50, debouncedSearch)
      setCustomers(data.items)
      setTotalPages(data.totalPages)
      setTotalItems(data.totalItems)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    loadData()
  }, [page, debouncedSearch])

  useRealtime('customers', () => {
    if (page === 1) loadData()
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/10 text-blue-600 border-blue-200'
      case 'interested':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
      case 'negotiating':
        return 'bg-purple-500/10 text-purple-600 border-purple-200'
      case 'converted':
        return 'bg-green-500/10 text-green-600 border-green-200'
      case 'inactive':
        return 'bg-gray-500/10 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'Novo'
      case 'interested':
        return 'Interessado'
      case 'negotiating':
        return 'Em Negociação'
      case 'converted':
        return 'Convertido'
      case 'inactive':
        return 'Inativo'
      default:
        return status || 'Indefinido'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
          <p className="text-muted-foreground">
            Gerencie seus {totalItems.toLocaleString('pt-BR')} clientes e leads.
          </p>
        </div>

        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleNormalize}
            disabled={isNormalizing}
            className="w-full"
          >
            {isNormalizing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            {isNormalizing ? 'Normalizando...' : 'Normalizar Números'}
          </Button>
          {isNormalizing && normalizeProgress && (
            <span className="text-[10px] text-muted-foreground text-center">
              Progresso: {normalizeProgress.processed} / {normalizeProgress.total}
            </span>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Lista de Clientes
            </div>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Marca/Loja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span>Carregando base de clientes...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-6 font-medium">
                      <div className="flex items-center gap-1.5">
                        {c.name &&
                        String(c.name).toUpperCase() !== 'FALSE' &&
                        String(c.name).toUpperCase() !== 'TRUE'
                          ? c.name
                          : 'Sem Nome'}
                        {c.is_verified ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-green-500" title="Verificado" />
                        ) : (
                          <ShieldAlert
                            className="w-3.5 h-3.5 text-muted-foreground/50"
                            title="Não verificado"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span>{c.phone || '-'}</span>
                        {c.phone && (
                          <span
                            className={cn(
                              'flex items-center gap-1 text-[10px]',
                              c.whatsapp_welcome_sent ? 'text-green-600' : 'text-amber-600',
                            )}
                            title={
                              c.whatsapp_welcome_sent ? 'Boas-vindas enviada' : 'Mensagem pendente'
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
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(c.status)}>
                        {getStatusLabel(c.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {c.source?.replace('_', ' ') || 'Indefinido'}
                    </TableCell>
                    <TableCell>{c.whatsapp_group_name || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t bg-muted/20 gap-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {(page - 1) * 50 + 1} até {Math.min(page * 50, totalItems)} de{' '}
              {totalItems.toLocaleString('pt-BR')} registros
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <div className="text-sm font-medium px-2">
                {page} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
