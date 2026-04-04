import { useState, useEffect, useMemo } from 'react'
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Eye,
  Search,
  Mail,
  Calendar,
  ArrowUpDown,
  Filter,
  X,
  Phone,
  MessageCircle,
  Zap,
} from 'lucide-react'
import { Customer, getCustomers } from '@/services/customers'
import { sendManualWhatsapp, sendReactivationCampaign } from '@/services/whatsapp'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { CustomerBenefits } from '@/components/admin/CustomerBenefits'

type SortField = 'totalSpent' | 'lastPurchase' | null
type SortDirection = 'asc' | 'desc'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkCampaignOpen, setBulkCampaignOpen] = useState(false)

  const [showFilters, setShowFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const { toast } = useToast()
  const [sendingWa, setSendingWa] = useState(false)

  const loadData = async () => {
    try {
      const data = await getCustomers()
      setCustomers(data)
      if (selectedCustomer) {
        const updated = data.find((c) => c.id === selectedCustomer.id)
        if (updated) setSelectedCustomer(updated)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', () => {
    loadData()
  })

  const handleSendWhatsapp = async (customerId: string) => {
    setSendingWa(true)
    try {
      await sendManualWhatsapp(customerId)
      toast({ description: 'Mensagem enviada com sucesso!' })
      loadData()
    } catch (e: any) {
      toast({
        description: e.message || 'Erro ao enviar WhatsApp. Verifique as configurações.',
        variant: 'destructive',
      })
    } finally {
      setSendingWa(false)
    }
  }

  const handleReactivate = async (customerId: string) => {
    setSendingWa(true)
    try {
      await sendReactivationCampaign([customerId])
      toast({ description: 'Campanha de reativação iniciada!' })
      loadData()
    } catch (e: any) {
      toast({ description: e.message || 'Erro ao iniciar campanha.', variant: 'destructive' })
    } finally {
      setSendingWa(false)
    }
  }

  const handleBulkReactivate = async () => {
    setSendingWa(true)
    try {
      await sendReactivationCampaign(selectedIds)
      toast({
        description: `${selectedIds.length} cliente(s) adicionado(s) à campanha de reativação!`,
      })
      setSelectedIds([])
      setBulkCampaignOpen(false)
      loadData()
    } catch (e: any) {
      toast({
        description: e.message || 'Erro ao iniciar campanha em massa.',
        variant: 'destructive',
      })
    } finally {
      setSendingWa(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'desc') setSortDirection('asc')
      else setSortField(null)
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getDerivedData = (c: Customer) => {
    const hash = c.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return {
      ordersCount: (hash % 10) + 1,
      totalSpent: ((hash % 10) + 1) * 350.5,
      lastPurchase: c.created,
      type: c.ranking_position ? 'Atacado' : 'Varejo',
      displayStatus: ['converted', 'interested', 'negotiating'].includes(c.status)
        ? 'Ativo'
        : 'Inativo',
    }
  }

  const isInactive = (updatedStr: string) => {
    const diff = Date.now() - new Date(updatedStr).getTime()
    return diff > 30 * 24 * 60 * 60 * 1000
  }

  const filteredAndSortedCustomers = useMemo(() => {
    let result = customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      const derived = getDerivedData(c)

      const matchesStatus =
        filterStatus === 'todos' ||
        (filterStatus === 'inativo'
          ? isInactive(c.updated)
          : derived.displayStatus.toLowerCase() === filterStatus.toLowerCase())

      return matchesSearch && matchesStatus
    })

    if (sortField) {
      result.sort((a, b) => {
        const dA = getDerivedData(a)
        const dB = getDerivedData(b)
        if (sortField === 'totalSpent')
          return sortDirection === 'asc'
            ? dA.totalSpent - dB.totalSpent
            : dB.totalSpent - dA.totalSpent
        if (sortField === 'lastPurchase')
          return sortDirection === 'asc'
            ? new Date(dA.lastPurchase).getTime() - new Date(dB.lastPurchase).getTime()
            : new Date(dB.lastPurchase).getTime() - new Date(dA.lastPurchase).getTime()
        return 0
      })
    }
    return result
  }, [searchTerm, filterStatus, sortField, sortDirection, customers])

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedCustomers.length && selectedIds.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredAndSortedCustomers.map((c) => c.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
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
        {selectedIds.length > 0 && (
          <Button
            onClick={() => setBulkCampaignOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Executar Campanha de Reativação ({selectedIds.length})
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">Base de Clientes</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
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
            <div className="p-4 bg-muted/40 rounded-lg border flex items-end gap-4 animate-in fade-in mt-4">
              <div className="space-y-2 flex-1">
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo {`> 30 dias`}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                onClick={() => setFilterStatus('todos')}
                className="text-muted-foreground"
              >
                <X className="w-4 h-4 mr-2" /> Limpar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] text-center">
                    <Checkbox
                      checked={
                        selectedIds.length > 0 &&
                        selectedIds.length === filteredAndSortedCustomers.length
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                  <TableHead className="w-[60px] text-center">Foto</TableHead>
                  <TableHead>Nome do Cliente</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Contato</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('lastPurchase')}
                  >
                    <div className="flex items-center gap-1">
                      Última Compra{' '}
                      {sortField === 'lastPurchase' && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('totalSpent')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Total Gasto{' '}
                      {sortField === 'totalSpent' && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                  </TableHead>
                  <TableHead className="text-center w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedCustomers.map((customer) => {
                  const derived = getDerivedData(customer)
                  const lastContactedAt = (customer as any).last_contacted_at
                  const customerInactive = isInactive(customer.updated)

                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedIds.includes(customer.id)}
                          onCheckedChange={() => toggleSelect(customer.id)}
                          aria-label={`Selecionar ${customer.name}`}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Avatar className="h-10 w-10 border shadow-sm mx-auto">
                          <AvatarImage
                            src={
                              customer.avatar
                                ? pb.files.getUrl(customer, customer.avatar, { thumb: '100x100' })
                                : undefined
                            }
                            alt={customer.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xs uppercase bg-primary/5 text-primary font-medium">
                            {customer.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email || 'Sem email'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={derived.type === 'Atacado' ? 'secondary' : 'outline'}
                          className={
                            derived.type === 'Atacado'
                              ? 'bg-accent/10 text-accent hover:bg-accent/20 border-transparent'
                              : ''
                          }
                        >
                          {derived.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customerInactive
                              ? 'secondary'
                              : derived.displayStatus === 'Ativo'
                                ? 'default'
                                : 'secondary'
                          }
                          className={
                            customerInactive
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : derived.displayStatus === 'Ativo'
                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                : ''
                          }
                        >
                          {customerInactive ? 'Inativo' : derived.displayStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {lastContactedAt
                          ? new Date(lastContactedAt).toLocaleDateString('pt-BR')
                          : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        {new Date(derived.lastPurchase).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap font-medium">
                        R$ {derived.totalSpent.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {customerInactive && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReactivate(customer.id)}
                              disabled={sendingWa}
                              title="Reativar Cliente"
                            >
                              <Zap className="w-4 h-4 text-amber-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedCustomer(customer)}
                            title="Ver Detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredAndSortedCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={bulkCampaignOpen} onOpenChange={setBulkCampaignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Campanha em Massa</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Você está prestes a acionar o envio do template{' '}
              <strong>"Campanha de Reativação"</strong> para{' '}
              <strong className="text-foreground">{selectedIds.length} cliente(s)</strong>{' '}
              selecionado(s).
            </p>
            <p className="text-sm text-muted-foreground">
              Todas as mensagens serão enfileiradas e enviadas de forma gradual. Deseja iniciar a
              campanha agora?
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setBulkCampaignOpen(false)}
              disabled={sendingWa}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBulkReactivate}
              disabled={sendingWa}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {sendingWa ? 'Enviando...' : 'Confirmar Envio'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <Tabs defaultValue="geral" className="flex-1 overflow-hidden flex flex-col mt-4">
              <TabsList className="w-full justify-start overflow-x-auto shrink-0">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                {selectedCustomer.ranking_position && (
                  <TabsTrigger
                    value="beneficios"
                    className="text-amber-600 font-semibold data-[state=active]:text-amber-700"
                  >
                    Esteira de Apoio
                  </TabsTrigger>
                )}
              </TabsList>

              <ScrollArea className="flex-1 mt-4 pr-4">
                <TabsContent value="geral" className="m-0 space-y-6 pb-4">
                  <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border">
                    <Avatar className="h-16 w-16 border shadow-sm">
                      <AvatarImage
                        src={
                          selectedCustomer.avatar
                            ? pb.files.getUrl(selectedCustomer, selectedCustomer.avatar, {
                                thumb: '200x200',
                              })
                            : undefined
                        }
                        alt={selectedCustomer.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xl font-bold uppercase bg-primary/10 text-primary">
                        {selectedCustomer.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {selectedCustomer.email || 'Sem e-mail'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />{' '}
                          {(selectedCustomer as any).phone || 'Sem telefone'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Desde{' '}
                          {new Date(selectedCustomer.created).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {(selectedCustomer as any).phone && selectedCustomer.ranking_position && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                            onClick={() => handleSendWhatsapp(selectedCustomer.id)}
                            disabled={sendingWa}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Boas-vindas (WhatsApp)
                          </Button>

                          {isInactive(selectedCustomer.updated) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                              onClick={() => handleReactivate(selectedCustomer.id)}
                              disabled={sendingWa}
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Campanha Reativação
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-medium text-muted-foreground mb-1">
                          Total de Pedidos
                        </span>
                        <span className="text-3xl font-bold">
                          {getDerivedData(selectedCustomer).ordersCount}
                        </span>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-medium text-muted-foreground mb-1">
                          Total Gasto (LTV)
                        </span>
                        <span className="text-3xl font-bold text-primary">
                          R$ {getDerivedData(selectedCustomer).totalSpent.toFixed(2)}
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {selectedCustomer.ranking_position && (
                  <TabsContent value="beneficios" className="m-0 pb-4">
                    <CustomerBenefits customer={selectedCustomer} />
                  </TabsContent>
                )}
              </ScrollArea>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
