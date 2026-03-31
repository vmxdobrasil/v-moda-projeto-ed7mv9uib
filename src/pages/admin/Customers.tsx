import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Search, Mail, Calendar, ArrowUpDown, Filter, X } from 'lucide-react'

// Mock Data updated with status and lastPurchase
const MOCK_CUSTOMERS = [
  {
    id: 'CUST-001',
    name: 'Ana Silva',
    email: 'ana.silva@example.com',
    registeredAt: '2023-01-15',
    lastPurchase: '2023-10-25',
    ordersCount: 5,
    totalSpent: 4500.0,
    status: 'Ativo',
    history: [
      { id: 'ORD-001', date: '2023-10-25', total: 1250.0, status: 'Pago' },
      { id: 'ORD-045', date: '2023-08-12', total: 850.0, status: 'Enviado' },
    ],
  },
  {
    id: 'CUST-002',
    name: 'Carlos Santos',
    email: 'carlos.santos@example.com',
    registeredAt: '2023-03-22',
    lastPurchase: '2023-10-24',
    ordersCount: 2,
    totalSpent: 900.0,
    status: 'Ativo',
    history: [{ id: 'ORD-002', date: '2023-10-24', total: 450.0, status: 'Pendente' }],
  },
  {
    id: 'CUST-003',
    name: 'Marina Costa',
    email: 'marina.costa@example.com',
    registeredAt: '2023-05-10',
    lastPurchase: '2023-09-05',
    ordersCount: 8,
    totalSpent: 7890.0,
    status: 'Inativo',
    history: [{ id: 'ORD-102', date: '2023-09-05', total: 2100.0, status: 'Enviado' }],
  },
  {
    id: 'CUST-004',
    name: 'João Oliveira',
    email: 'joao.oliveira@example.com',
    registeredAt: '2023-07-01',
    lastPurchase: '2023-10-22',
    ordersCount: 1,
    totalSpent: 1500.0,
    status: 'Inativo',
    history: [{ id: 'ORD-004', date: '2023-10-22', total: 1500.0, status: 'Cancelado' }],
  },
]

type SortField = 'totalSpent' | 'lastPurchase' | null
type SortDirection = 'asc' | 'desc'

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<(typeof MOCK_CUSTOMERS)[0] | null>(null)

  // Advanced filters
  const [showFilters, setShowFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [minSpent, setMinSpent] = useState<string>('')
  const [maxSpent, setMaxSpent] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  // Sorting
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'desc') setSortDirection('asc')
      else setSortField(null)
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredAndSortedCustomers = useMemo(() => {
    let result = MOCK_CUSTOMERS.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        filterStatus === 'todos' || c.status.toLowerCase() === filterStatus.toLowerCase()
      const spent = c.totalSpent
      const matchesMin = minSpent ? spent >= Number(minSpent) : true
      const matchesMax = maxSpent ? spent <= Number(maxSpent) : true
      const regDate = new Date(c.registeredAt).getTime()
      const matchesDateFrom = dateFrom ? regDate >= new Date(dateFrom).getTime() : true
      const matchesDateTo = dateTo ? regDate <= new Date(dateTo).getTime() : true

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMin &&
        matchesMax &&
        matchesDateFrom &&
        matchesDateTo
      )
    })

    if (sortField) {
      result.sort((a, b) => {
        if (sortField === 'totalSpent') {
          return sortDirection === 'asc' ? a.totalSpent - b.totalSpent : b.totalSpent - a.totalSpent
        }
        if (sortField === 'lastPurchase') {
          const tA = new Date(a.lastPurchase).getTime()
          const tB = new Date(b.lastPurchase).getTime()
          return sortDirection === 'asc' ? tA - tB : tB - tA
        }
        return 0
      })
    }

    return result
  }, [searchTerm, filterStatus, minSpent, maxSpent, dateFrom, dateTo, sortField, sortDirection])

  const clearFilters = () => {
    setFilterStatus('todos')
    setMinSpent('')
    setMaxSpent('')
    setDateFrom('')
    setDateTo('')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'bg-emerald-500 hover:bg-emerald-600'
      case 'Pendente':
        return 'bg-amber-500 hover:bg-amber-600'
      case 'Enviado':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'Cancelado':
        return 'bg-rose-500 hover:bg-rose-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CRM e Clientes</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie os perfis dos seus clientes e histórico de compras.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-lg">Base de Clientes</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou e-mail..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant={showFilters ? 'secondary' : 'outline'}
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="p-4 bg-muted/40 rounded-lg border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label>Atividade de compra</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor Médio do Pedido (LTV) - Mín</Label>
                  <Input
                    type="number"
                    placeholder="R$ 0,00"
                    value={minSpent}
                    onChange={(e) => setMinSpent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Médio do Pedido (LTV) - Máx</Label>
                  <Input
                    type="number"
                    placeholder="R$ 10.000,00"
                    value={maxSpent}
                    onChange={(e) => setMaxSpent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Registro (De)</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Registro (Até)</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
                <div className="flex items-end justify-end col-span-1 sm:col-span-2 md:col-span-3 pb-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground"
                  >
                    <X className="w-3 h-3 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Cliente</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('lastPurchase')}
                  >
                    <div className="flex items-center gap-1">
                      Última Compra
                      {sortField === 'lastPurchase' && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Total de Pedidos</TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('totalSpent')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Total Gasto
                      {sortField === 'totalSpent' && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                  </TableHead>
                  <TableHead className="text-center w-[80px]">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={customer.status === 'Ativo' ? 'default' : 'secondary'}
                        className={
                          customer.status === 'Ativo' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                        }
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(customer.lastPurchase).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{customer.ordersCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap font-medium">
                      R$ {customer.totalSpent.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAndSortedCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum cliente encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6 mt-4">
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {selectedCustomer.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Desde{' '}
                      {new Date(selectedCustomer.registeredAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-medium text-muted-foreground mb-1">
                      Total de Pedidos
                    </span>
                    <span className="text-3xl font-bold">{selectedCustomer.ordersCount}</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-medium text-muted-foreground mb-1">
                      Total Gasto (LTV)
                    </span>
                    <span className="text-3xl font-bold text-primary">
                      R$ {selectedCustomer.totalSpent.toFixed(2)}
                    </span>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-sm">Histórico de Pedidos Recentes</h4>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="h-9">ID</TableHead>
                        <TableHead className="h-9">Data</TableHead>
                        <TableHead className="h-9">Status</TableHead>
                        <TableHead className="h-9 text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCustomer.history.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="py-2 font-medium">{order.id}</TableCell>
                          <TableCell className="py-2">
                            {new Date(order.date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge
                              className={`text-white border-transparent ${getStatusColor(order.status)}`}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2 text-right font-medium">
                            R$ {order.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
