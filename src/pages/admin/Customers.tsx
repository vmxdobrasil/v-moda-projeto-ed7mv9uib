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
import { Users, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

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

  const debouncedSearch = useDebounce(search, 500)

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
          <p className="text-muted-foreground">Gerencie seus {totalItems} clientes e leads.</p>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span>Carregando dados...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-6 font-medium">{c.name}</TableCell>
                    <TableCell>{c.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(c.status)}>
                        {getStatusLabel(c.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {c.source?.replace('_', ' ') || 'Indefinido'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t bg-muted/20">
              <div className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
