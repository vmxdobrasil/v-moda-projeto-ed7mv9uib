import { useState, useEffect } from 'react'
import {
  getCustomers,
  updateCustomer,
  createCustomer,
  deleteCustomer,
  Customer,
} from '@/services/customers'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  UserPlus,
  MessageSquare,
  Trash2,
  Settings,
  UploadCloud,
  Pencil,
  BadgeCheck,
  MessageCircle,
  Download,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GripVertical } from 'lucide-react'
import RankingTab from './components/RankingTab'
import ImportLeadsDialog from './components/ImportLeadsDialog'
import AnalyticsTab from './components/AnalyticsTab'
import InsightsTab from './components/InsightsTab'

export default function CRM() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  const [isNewOpen, setIsNewOpen] = useState(false)

  const exportToCSV = () => {
    const headers = [
      'Nome',
      'Email',
      'Telefone',
      'Status',
      'Origem',
      'Categoria',
      'Zona de Exclusividade',
      'Cliques WhatsApp',
    ]

    const rows = filteredCustomers.map((c) =>
      [
        c.name || '',
        c.email || '',
        c.phone || '',
        c.status || '',
        c.source || '',
        c.ranking_category || '',
        c.exclusivity_zone || '',
        (c.whatsapp_clicks || 0).toString(),
      ]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(','),
    )

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    status: 'new',
    source: 'manual',
    is_verified: false,
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const loadData = async () => {
    try {
      const data = await getCustomers()
      setCustomers(data)

      const msgs = await pb.collection('messages').getFullList({
        filter: `direction = 'inbound'`,
        sort: '-created',
        expand: 'channel',
      })

      const phones = new Set(data.map((c) => c.phone).filter(Boolean))
      const uniqueSenders = new Map()

      msgs.forEach((msg) => {
        const sid = msg.sender_id
        if (!phones.has(sid) && !uniqueSenders.has(sid)) {
          const sourceMap: any = { whatsapp: 'whatsapp', instagram: 'instagram', email: 'email' }
          const source = msg.expand?.channel?.type ? sourceMap[msg.expand.channel.type] : 'whatsapp'

          uniqueSenders.set(sid, {
            id: sid,
            name: msg.sender_name || `Lead ${sid.substring(0, 4)}`,
            phone: sid,
            source: source || 'whatsapp',
            lastMessage: msg.content,
            date: msg.created,
          })
        }
      })

      setSuggestions(Array.from(uniqueSenders.values()))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', () => {
    if (!isImporting) {
      loadData()
    }
  })
  useRealtime('messages', () => {
    loadData()
  })
  useRealtime('notifications', (e) => {
    if (e.action === 'create' && e.record.user === pb.authStore.record?.id) {
      toast.info(e.record.title, {
        description: e.record.message,
      })
    }
  })

  const handleStatusChange = async (id: string, status: Customer['status']) => {
    try {
      await updateCustomer(id, { status })
      toast.success('Status atualizado')
    } catch (err) {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleCreate = async () => {
    if (!newCustomer.name) {
      toast.error('Nome é obrigatório')
      return
    }
    try {
      if (avatarFile) {
        const formData = new FormData()
        Object.entries(newCustomer).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString())
          }
        })
        formData.append('avatar', avatarFile)
        await createCustomer(formData)
      } else {
        await createCustomer(newCustomer)
      }
      toast.success('Lead criado com sucesso')
      setIsNewOpen(false)
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        status: 'new',
        source: 'manual',
        is_verified: false,
      })
      setAvatarFile(null)
    } catch (err) {
      toast.error('Erro ao criar lead')
    }
  }

  const handleEdit = async () => {
    if (!editingCustomer) return
    if (!editingCustomer.name) {
      toast.error('Nome é obrigatório')
      return
    }
    try {
      await updateCustomer(editingCustomer.id, {
        name: editingCustomer.name,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        is_verified: editingCustomer.is_verified,
        bio: editingCustomer.bio,
      })
      toast.success('Lead atualizado com sucesso')
      setEditingCustomer(null)
    } catch (err) {
      toast.error('Erro ao atualizar lead')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este lead?')) {
      try {
        await deleteCustomer(id)
        toast.success('Lead removido com sucesso')
      } catch (err) {
        toast.error('Erro ao remover lead')
      }
    }
  }

  const handleAcceptSuggestion = async (suggestion: any) => {
    try {
      await createCustomer({
        name: suggestion.name,
        phone: suggestion.phone,
        source: suggestion.source,
        status: 'new',
        is_verified: false,
      })
      toast.success('Lead adicionado ao CRM!')
    } catch (err) {
      toast.error('Erro ao adicionar lead')
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      (statusFilter === 'all' || c.status === statusFilter) &&
      (sourceFilter === 'all' || c.source === sourceFilter),
  )

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    interested: 'bg-yellow-100 text-yellow-800',
    negotiating: 'bg-purple-100 text-purple-800',
    converted: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
  }

  const categoryLabels: Record<string, string> = {
    moda_feminina: 'Moda Feminina',
    jeans: 'Jeans',
    moda_praia: 'Moda Praia',
    moda_geral: 'Moda Geral',
    moda_masculina: 'Moda Masculina',
    moda_evangelica: 'Moda Evangélica',
    moda_country: 'Moda Country',
    moda_infantil: 'Moda Infantil',
    bijouterias_semijoias: 'Bijouterias / Semijoias',
    calcados: 'Calçados',
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM de Vendas</h1>
          <p className="text-muted-foreground">Gerencie seus leads e oportunidades de negócio.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/dashboard/settings/whatsapp">
              <Settings className="w-4 h-4 mr-2" /> WhatsApp API
            </Link>
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" /> Exportar Leads (CSV)
          </Button>
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <UploadCloud className="w-4 h-4 mr-2" /> Importar Leads
          </Button>
          <ImportLeadsDialog
            open={isImportOpen}
            onOpenChange={setIsImportOpen}
            onImportStateChange={setIsImporting}
            onImportComplete={loadData}
          />

          <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" /> Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Lead</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Foto da Loja / Revendedora (Opcional)</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG ou WebP. Máx 2MB. Use uma foto real para humanizar o perfil.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Origem</Label>
                  <Select
                    value={newCustomer.source}
                    onValueChange={(v: any) => setNewCustomer({ ...newCustomer, source: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between mt-2 p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Perfil Verificado</Label>
                    <p className="text-xs text-muted-foreground">
                      Exibir selo de confiança público.
                    </p>
                  </div>
                  <Switch
                    checked={newCustomer.is_verified || false}
                    onCheckedChange={(c) => setNewCustomer({ ...newCustomer, is_verified: c })}
                  />
                </div>
                <Button className="w-full mt-2" onClick={handleCreate}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={!!editingCustomer}
            onOpenChange={(open) => !open && setEditingCustomer(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Lead / Parceiro</DialogTitle>
              </DialogHeader>
              {editingCustomer && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome</Label>
                    <Input
                      id="edit-name"
                      value={editingCustomer.name}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingCustomer.email || ''}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input
                      id="edit-phone"
                      value={editingCustomer.phone || ''}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-bio">Bio / Descrição</Label>
                    <Textarea
                      id="edit-bio"
                      value={editingCustomer.bio || ''}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, bio: e.target.value })
                      }
                      placeholder="Descrição breve da loja..."
                      className="resize-none h-20"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Perfil Verificado</Label>
                      <p className="text-xs text-muted-foreground">
                        Exibir selo de confiança público.
                      </p>
                    </div>
                    <Switch
                      checked={editingCustomer.is_verified || false}
                      onCheckedChange={(c) =>
                        setEditingCustomer({ ...editingCustomer, is_verified: c })
                      }
                    />
                  </div>
                  <Button className="w-full mt-4" onClick={handleEdit}>
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="leads">Meus Leads</TabsTrigger>
          <TabsTrigger value="funnel">Funil de Vendas</TabsTrigger>
          <TabsTrigger value="suggestions" className="relative">
            Sugestões de Captura
            {suggestions.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {suggestions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rankings">Rankings & Exclusividade</TabsTrigger>
          <TabsTrigger value="analytics">Relatórios</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="h-[calc(100vh-250px)]">
          <div className="flex gap-4 overflow-x-auto pb-4 h-full">
            {['new', 'interested', 'negotiating', 'converted', 'inactive'].map((status) => (
              <div
                key={status}
                className="flex-1 min-w-[280px] bg-muted/30 rounded-lg p-4 flex flex-col border border-border/50"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const id = e.dataTransfer.getData('customerId')
                  if (id) handleStatusChange(id, status as Customer['status'])
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm uppercase flex items-center gap-2">
                    {status === 'new' && 'Novos'}
                    {status === 'interested' && 'Interessados'}
                    {status === 'negotiating' && 'Em Negociação'}
                    {status === 'converted' && 'Convertidos'}
                    {status === 'inactive' && 'Inativos'}
                    <span className="bg-background text-muted-foreground text-xs py-0.5 px-2 rounded-full border">
                      {customers.filter((c) => c.status === status).length}
                    </span>
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {customers
                    .filter((c) => c.status === status)
                    .map((c) => (
                      <div
                        key={c.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('customerId', c.id)}
                        className="bg-card p-3 rounded-lg shadow-sm border border-border cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors group relative"
                      >
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="pl-6">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-sm truncate pr-2">{c.name}</span>
                            {c.is_verified && (
                              <BadgeCheck
                                className="w-4 h-4 text-green-500 shrink-0"
                                title="Verificado"
                              />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground capitalize">
                              {c.ranking_category
                                ? categoryLabels[c.ranking_category] || c.ranking_category
                                : 'Sem categoria'}
                            </span>
                            <span className="text-xs font-medium bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              {c.source}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  {customers.filter((c) => c.status === status).length === 0 && (
                    <div className="h-24 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                      Solte leads aqui
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="flex gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
            <div className="w-64">
              <Label className="mb-2 block text-xs font-semibold text-muted-foreground">
                Filtrar por Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="new">Novo</SelectItem>
                  <SelectItem value="interested">Interessado</SelectItem>
                  <SelectItem value="negotiating">Em Negociação</SelectItem>
                  <SelectItem value="converted">Convertido</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-64">
              <Label className="mb-2 block text-xs font-semibold text-muted-foreground">
                Filtrar por Origem
              </Label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as Origens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Origens</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Categoria / Zona</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cliques WA</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Carregando leads...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum lead encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm">
                            <AvatarImage
                              src={
                                customer.avatar
                                  ? pb.files.getUrl(customer, customer.avatar, { thumb: '100x100' })
                                  : undefined
                              }
                              alt={customer.name}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-sm font-semibold uppercase bg-primary/5 text-primary">
                              {customer.name
                                ? customer.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase()
                                : 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1.5">
                              {customer.name}
                              {customer.is_verified && (
                                <BadgeCheck className="w-4 h-4 text-green-500" title="Verificado" />
                              )}
                            </div>
                            {customer.ranking_category && customer.ranking_position && (
                              <div className="mt-1 flex items-center gap-1">
                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-800">
                                  <span className="mr-1">🏆</span> TOP {customer.ranking_position}
                                </span>
                                {customer.is_exclusive && (
                                  <span
                                    className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800"
                                    title={customer.exclusivity_zone}
                                  >
                                    Exclusivo
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{customer.email || '-'}</div>
                        <div className="text-xs text-muted-foreground">{customer.phone || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {customer.ranking_category
                            ? categoryLabels[customer.ranking_category] || customer.ranking_category
                            : '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {customer.exclusivity_zone || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize text-sm">{customer.source}</TableCell>
                      <TableCell>
                        <Select
                          value={customer.status}
                          onValueChange={(v: any) => handleStatusChange(customer.id, v)}
                        >
                          <SelectTrigger
                            className={`h-8 w-[140px] ${statusColors[customer.status]} border-0 font-medium`}
                          >
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <MessageCircle className="w-4 h-4 text-green-500" />
                          {customer.whatsapp_clicks || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(customer.created).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCustomer(customer)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Editar Lead"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-1"
                          title="Remover Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="suggestions">
          <div className="rounded-md border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contato Identificado</TableHead>
                  <TableHead>Última Mensagem</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                      Nenhuma sugestão de lead no momento.
                      <br />
                      Sincronizando novas mensagens automaticamente.
                    </TableCell>
                  </TableRow>
                ) : (
                  suggestions.map((sug) => (
                    <TableRow key={sug.id}>
                      <TableCell>
                        <div className="font-medium">{sug.name}</div>
                        <div className="text-xs text-muted-foreground">{sug.phone}</div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-sm" title={sug.lastMessage}>
                        {sug.lastMessage}
                      </TableCell>
                      <TableCell className="capitalize text-sm">{sug.source}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(sug.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleAcceptSuggestion(sug)}>
                          <UserPlus className="w-4 h-4 mr-2" /> Salvar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="rankings">
          <RankingTab customers={customers} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab customers={customers} />
        </TabsContent>

        <TabsContent value="insights">
          <InsightsTab customers={customers} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
