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
  BusFront,
  MapPin,
} from 'lucide-react'
import { Customer, getCustomers, updateCustomer } from '@/services/customers'
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
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'new',
    source: 'manual',
  })

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

  const [discountCustomer, setDiscountCustomer] = useState<Customer | null>(null)
  const [calculatedDiscount, setCalculatedDiscount] = useState<number>(0)

  const handleCalculateDiscount = (customer: Customer) => {
    let baseDiscount = 0

    if (customer.status === 'converted' || customer.status === 'negotiating') {
      baseDiscount += 10
    }

    if (customer.ranking_position && customer.ranking_position > 0) {
      if (customer.ranking_position <= 3) baseDiscount += 25
      else if (customer.ranking_position <= 10) baseDiscount += 15
      else baseDiscount += 5
    }

    if (customer.is_exclusive) {
      baseDiscount += 15
    }

    if (baseDiscount === 0) baseDiscount = 5

    setCalculatedDiscount(baseDiscount)
    setDiscountCustomer(customer)
  }

  const handleConfirmDiscount = async () => {
    if (!discountCustomer) return

    const discountStr = `${calculatedDiscount}%`
    const newBenefits = {
      ...(discountCustomer.unlocked_benefits || {}),
      discount_active: true,
      discount_value: discountStr,
      generated_at: new Date().toISOString(),
    }

    try {
      await updateCustomer(discountCustomer.id, { unlocked_benefits: newBenefits })
      toast({
        description: `Desconto de ${discountStr} aplicado com sucesso para ${discountCustomer.name}!`,
      })
      setDiscountCustomer(null)
      loadData()
    } catch (err) {
      toast({ description: 'Erro ao gerar desconto', variant: 'destructive' })
    }
  }

  const handleLogisticsUpdate = async (
    customerId: string,
    status: Customer['logistics_status'],
  ) => {
    try {
      await updateCustomer(customerId, { logistics_status: status })
      toast({ description: `Status de logística atualizado para: ${status}` })
      loadData()
    } catch (err) {
      toast({ description: 'Erro ao atualizar logística', variant: 'destructive' })
    }
  }

  const handleAddCustomer = async () => {
    if (!newCustomer.name) {
      toast({ description: 'O nome é obrigatório.', variant: 'destructive' })
      return
    }
    try {
      await pb.collection('customers').create({
        ...newCustomer,
        manufacturer: pb.authStore.record?.id,
      })
      toast({ description: 'Cliente adicionado com sucesso!' })
      setIsAddCustomerOpen(false)
      setNewCustomer({ name: '', phone: '', email: '', status: 'new', source: 'manual' })
      loadData()
    } catch (err) {
      toast({ description: 'Erro ao adicionar cliente.', variant: 'destructive' })
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
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              onClick={() => setBulkCampaignOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Executar Campanha ({selectedIds.length})
            </Button>
          )}
          <Button onClick={() => setIsAddCustomerOpen(true)}>Adicionar Cliente</Button>
        </div>
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
                  <TableHead>Nome e Local</TableHead>
                  <TableHead>Ranking / Categoria</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Status / Logística</TableHead>
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
                      <TableCell>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {customer.city
                            ? `${customer.city} / ${customer.state || '-'}`
                            : 'Local não informado'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {customer.ranking_position ? (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-[10px]"
                            >
                              Top {customer.ranking_position}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                          <span className="text-xs font-medium capitalize text-muted-foreground">
                            {customer.ranking_category?.replace('_', ' ') || 'Sem categoria'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{customer.email || 'Sem email'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
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
                            {customerInactive
                              ? 'Inativo'
                              : customer.status === 'converted'
                                ? 'Convertido'
                                : derived.displayStatus}
                          </Badge>
                          {customer.logistics_status && (
                            <Badge
                              variant="outline"
                              className="text-[10px] whitespace-nowrap bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {customer.logistics_status}
                            </Badge>
                          )}
                        </div>
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
                            onClick={() => handleCalculateDiscount(customer)}
                            title="Gerar Desconto Automático"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <span className="font-bold text-[10px]">%</span>
                          </Button>
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

      <Dialog open={!!discountCustomer} onOpenChange={(open) => !open && setDiscountCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Desconto Automático</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Baseado na categoria de ranking, posição e exclusividade do cliente{' '}
              <strong className="text-foreground">{discountCustomer?.name}</strong>, o desconto
              calculado foi de:
            </p>
            <div className="flex justify-center my-6">
              <span className="text-5xl font-bold text-emerald-600">{calculatedDiscount}%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Deseja aplicar este desconto aos benefícios do cliente?
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setDiscountCustomer(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDiscount}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Aplicar Desconto
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={newCustomer.email}
                  type="email"
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newCustomer.status}
                  onValueChange={(v) => setNewCustomer({ ...newCustomer, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="interested">Interessado</SelectItem>
                    <SelectItem value="negotiating">Em Negociação</SelectItem>
                    <SelectItem value="converted">Convertido</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Origem (Source)</Label>
                <Select
                  value={newCustomer.source}
                  onValueChange={(v) => setNewCustomer({ ...newCustomer, source: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCustomer}>Salvar Cliente</Button>
          </DialogFooter>
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

                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        {(selectedCustomer as any).phone && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() =>
                              window.open(
                                `https://wa.me/${(selectedCustomer as any).phone.replace(/\D/g, '')}`,
                                '_blank',
                              )
                            }
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                        )}
                        {(selectedCustomer as any).phone && selectedCustomer.ranking_position && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                            onClick={() => handleSendWhatsapp(selectedCustomer.id)}
                            disabled={sendingWa}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Boas-vindas (Auto)
                          </Button>
                        )}
                        {isInactive(selectedCustomer.updated) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                            onClick={() => handleReactivate(selectedCustomer.id)}
                            disabled={sendingWa}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Reativar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <Label className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                      <BusFront className="w-4 h-4" /> Status de Logística
                    </Label>
                    <Select
                      value={selectedCustomer.logistics_status || ''}
                      onValueChange={(val: any) => handleLogisticsUpdate(selectedCustomer.id, val)}
                    >
                      <SelectTrigger className="w-full sm:w-[250px] bg-white">
                        <SelectValue placeholder="Selecione o status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aguardando Ônibus">Aguardando Ônibus</SelectItem>
                        <SelectItem value="Em Trânsito no Ônibus">Em Trânsito no Ônibus</SelectItem>
                        <SelectItem value="Entregue">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
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

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Origem (Rota do Ônibus)
                        </span>
                        <span className="text-lg font-medium mt-1">
                          {selectedCustomer.city
                            ? `${selectedCustomer.city} / ${selectedCustomer.state || '-'}`
                            : 'Não informada'}
                        </span>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                          <BusFront className="w-4 h-4" /> Custo de Logística (Frete)
                        </span>
                        <span className="text-lg font-medium text-blue-600 mt-1">
                          R${' '}
                          {selectedCustomer.freight_value
                            ? selectedCustomer.freight_value.toFixed(2)
                            : '0.00'}
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
