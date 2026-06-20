import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Store,
  Users,
  ShoppingBag,
  TrendingUp,
  Mail,
  Phone,
  Clock,
  AlignLeft,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useRealtime } from '@/hooks/use-realtime'

const KANBAN_COLUMNS = [
  { id: 'lead', title: 'Lead' },
  { id: 'contact', title: 'Contato' },
  { id: 'proposal', title: 'Proposta Enviada' },
  { id: 'negotiation', title: 'Negociação' },
  { id: 'closed', title: 'Pedido Confirmado' },
]

function CustomerDetailsSheet({ customer, open, onOpenChange, onUpdate }: any) {
  const [notes, setNotes] = useState('')
  const [transactions, setTransactions] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (customer && open) {
      setNotes(customer.notes || '')
      loadTransactions()
    }
  }, [customer, open])

  const loadTransactions = async () => {
    try {
      const res = await pb.collection('v_club_transactions').getList(1, 10, {
        filter: `card.customer = "${customer.id}"`,
        sort: '-created',
      })
      setTransactions(res.items)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSaveNotes = async () => {
    try {
      const updated = await pb.collection('customers').update(customer.id, { notes })
      toast({ title: 'Notas salvas com sucesso!' })
      onUpdate(updated)
    } catch (e) {
      toast({ title: 'Erro ao salvar notas', variant: 'destructive' })
    }
  }

  if (!customer) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={customer.avatar ? pb.files.getURL(customer, customer.avatar) : ''}
              />
              <AvatarFallback>{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-2xl">{customer.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-orange-500 border-orange-500 uppercase text-[10px]"
                >
                  {KANBAN_COLUMNS.find((c) => c.id === customer.status)?.title || customer.status}
                </Badge>
                {customer.city && customer.state && (
                  <span className="flex items-center text-sm">
                    <MapPin className="h-3 w-3 mr-1" /> {customer.city}, {customer.state}
                  </span>
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-3 rounded-lg border border-border/50">
              <p className="text-xs text-muted-foreground flex items-center mb-1 font-medium">
                <DollarSign className="h-3 w-3 mr-1 text-orange-500" /> Valor Estimado
              </p>
              <p className="font-bold text-lg">
                {customer.estimated_value ? `R$ ${customer.estimated_value.toFixed(2)}` : 'N/A'}
              </p>
            </div>
            <div className="bg-muted p-3 rounded-lg border border-border/50">
              <p className="text-xs text-muted-foreground flex items-center mb-1 font-medium">
                <Calendar className="h-3 w-3 mr-1 text-orange-500" /> Entrega
              </p>
              <p className="font-bold text-lg">
                {customer.shipping_date
                  ? new Date(customer.shipping_date).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center text-sm uppercase tracking-wider text-muted-foreground">
              <Clock className="h-4 w-4 mr-2 text-orange-500" /> Histórico de Pedidos
            </h4>
            {transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">Transação V Club</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(t.created).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <span className="font-bold text-orange-600">R$ {t.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic bg-muted/30 p-4 rounded-lg text-center">
                Nenhuma transação registrada.
              </p>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center text-sm uppercase tracking-wider text-muted-foreground">
              <AlignLeft className="h-4 w-4 mr-2 text-orange-500" /> Notas e Comunicação
            </h4>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione notas sobre as negociações com o cliente..."
              className="min-h-[150px] mb-3 resize-none bg-muted/30 border-border/50 focus:bg-background focus:ring-orange-500"
            />
            <Button
              onClick={handleSaveNotes}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full"
            >
              Salvar Histórico
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function Leads() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeRetailers: 0,
    linkedConsultants: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
  })

  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await pb.collection('customers').getFullList({
        filter: `manufacturer = "${user.id}"`,
        sort: '-updated',
      })
      setCustomers(data)

      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      const startStr = startOfMonth.toISOString().replace('T', ' ')

      const transactions = await pb.collection('v_club_transactions').getFullList({
        filter: `store = "${user.id}" && created >= "${startStr}" && status = "approved"`,
      })
      const monthlyRevenue = transactions.reduce((acc, t) => acc + (t.amount || 0), 0)

      const active = data.filter((c) => c.status === 'closed' || c.status === 'converted').length
      const uniqueConsultants = new Set(
        data.filter((c) => c.affiliate_referrer).map((c) => c.affiliate_referrer),
      ).size
      const monthlyOrders = data.filter(
        (c) => c.status === 'closed' && new Date(c.updated) >= startOfMonth,
      ).length

      setStats({
        activeRetailers: active,
        linkedConsultants: uniqueConsultants,
        monthlyOrders,
        monthlyRevenue,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('customers', () => {
    loadData()
  })

  const openCustomer = (c: any) => {
    setSelectedCustomer(c)
    setSheetOpen(true)
  }

  const handleUpdate = (updated: any) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setSelectedCustomer(updated)
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('customerId', id)
  }

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('customerId')
    if (!id) return

    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))

    try {
      await pb.collection('customers').update(id, { status })
      toast({ title: 'Status atualizado com sucesso' })
    } catch (err) {
      loadData()
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
      const matchRegion = regionFilter === 'all' || c.state === regionFilter
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      return matchSearch && matchRegion && matchStatus
    })
  }, [customers, search, regionFilter, statusFilter])

  const states = Array.from(new Set(customers.map((c) => c.state).filter(Boolean)))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-orange-500 text-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Store className="h-7 w-7" /> CRM Exclusivo: Marcas TOP 60
          </h2>
          <p className="opacity-90 mt-1 max-w-2xl text-sm">
            Marcas do TOP 60 são escolhidas pela curadoria da Revista Moda Atual e da plataforma V
            MODA BRASIL.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-white text-orange-600 font-bold px-4 py-1.5 text-xs uppercase shadow-sm"
        >
          Curadoria Aprovada
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Lojistas Ativos</p>
              <Store className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.activeRetailers}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Consultoras Vinculadas</p>
              <Users className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.linkedConsultants}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Pedidos do Mês</p>
              <ShoppingBag className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.monthlyOrders}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Faturamento (Mês)</p>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              R$ {stats.monthlyRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <div className="flex items-center justify-between mb-4 bg-muted/30 p-1.5 rounded-lg border border-border">
          <TabsList className="bg-transparent">
            <TabsTrigger
              value="kanban"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              Pipeline Kanban
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              Lista de Clientes
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="m-0">
          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 hide-scrollbar h-[calc(100vh-350px)] min-h-[600px]">
            {KANBAN_COLUMNS.map((col) => {
              const colCustomers = customers.filter((c) => c.status === col.id)
              return (
                <div
                  key={col.id}
                  className="flex-shrink-0 w-80 flex flex-col bg-muted/30 border border-border/50 rounded-xl p-3"
                  onDrop={(e) => handleDrop(e, col.id)}
                  onDragOver={handleDragOver}
                >
                  <div className="flex items-center justify-between mb-3 px-1 border-b border-border/50 pb-2">
                    <h3 className="font-bold text-sm text-foreground/80 uppercase tracking-wider">
                      {col.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-background shadow-sm text-orange-600 font-bold"
                    >
                      {colCustomers.length}
                    </Badge>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="space-y-3 pb-2 px-1">
                      {colCustomers.map((c) => (
                        <div
                          key={c.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, c.id)}
                          onClick={() => openCustomer(c)}
                          className="bg-background p-4 rounded-xl shadow-sm border border-border cursor-grab active:cursor-grabbing hover:border-orange-500 hover:shadow-md transition-all group"
                        >
                          <div className="font-semibold text-sm mb-2 group-hover:text-orange-600 transition-colors">
                            {c.name}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1.5">
                            <div className="flex items-center justify-between bg-muted/50 p-1.5 rounded">
                              <span className="flex items-center font-medium">
                                <DollarSign className="h-3 w-3 mr-1 text-orange-500" /> Valor
                              </span>
                              <span className="font-bold text-foreground">
                                R$ {c.estimated_value ? c.estimated_value.toFixed(2) : '0.00'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between px-1.5">
                              <span className="flex items-center">
                                <ShoppingBag className="h-3 w-3 mr-1" /> Peças (Est.)
                              </span>
                              <span className="font-semibold text-foreground">
                                {c.estimated_value ? Math.floor(c.estimated_value / 100) : 0}
                              </span>
                            </div>
                            {c.shipping_date && (
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 px-1.5">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" /> Entrega
                                </span>
                                <span className="font-semibold text-orange-600">
                                  {new Date(c.shipping_date).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {colCustomers.length === 0 && (
                        <div className="text-center p-6 border-2 border-dashed border-border/50 rounded-xl text-sm text-muted-foreground bg-background/50">
                          Arraste cards para cá
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="list" className="m-0 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="py-4 border-b border-border/50 bg-muted/10">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente por nome ou e-mail..."
                    className="pl-9 focus-visible:ring-orange-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="w-[180px] focus:ring-orange-500">
                      <SelectValue placeholder="Região" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Regiões</SelectItem>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] focus:ring-orange-500">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      {KANBAN_COLUMNS.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                        Cliente
                      </th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                        Contato
                      </th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                        Região
                      </th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                        Status
                      </th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                              <AvatarFallback className="bg-orange-100 text-orange-700">
                                {c.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-foreground/90">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {c.email && (
                            <div className="flex items-center mb-1">
                              <Mail className="h-3 w-3 mr-1.5 opacity-70" /> {c.email}
                            </div>
                          )}
                          {c.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1.5 opacity-70" /> {c.phone}
                            </div>
                          )}
                          {!c.email && !c.phone && (
                            <span className="italic text-xs">Sem contato</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground/80">
                          {c.state ? `${c.city ? c.city + ', ' : ''}${c.state}` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className="text-orange-600 border-orange-500/30 bg-orange-50 shadow-sm"
                          >
                            {KANBAN_COLUMNS.find((col) => col.id === c.status)?.title || c.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openCustomer(c)}
                            className="hover:text-orange-600 hover:bg-orange-50"
                          >
                            Ver Detalhes
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-muted-foreground bg-muted/10"
                        >
                          Nenhum cliente encontrado para os filtros atuais.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CustomerDetailsSheet
        customer={selectedCustomer}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdate={handleUpdate}
      />
    </div>
  )
}
