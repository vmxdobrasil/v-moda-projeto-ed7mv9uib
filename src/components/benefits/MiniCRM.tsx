import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Pencil,
  ArrowRight,
  TrendingUp,
  Users,
  PhoneCall,
  Handshake,
  CheckCircle,
} from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { format } from 'date-fns'

type FunnelStatus = 'new' | 'contact' | 'negotiation' | 'closed'

interface Customer {
  id: string
  name: string
  origin_store_name: string
  phone: string
  source: string
  status: FunnelStatus | string
  last_action_date: string
  updated: string
  created: string
}

const statusMap: Record<string, { label: string; color: string; next?: FunnelStatus }> = {
  new: { label: 'Novo', color: 'bg-blue-500 text-white', next: 'contact' },
  contact: { label: 'Em contato', color: 'bg-yellow-500 text-yellow-950', next: 'negotiation' },
  negotiation: { label: 'Venda iniciada', color: 'bg-orange-500 text-white', next: 'closed' },
  closed: { label: 'Fechada', color: 'bg-green-500 text-white' },
}

const sourceMap: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  email: 'E-mail',
  site: 'Site',
  manual: 'Manual',
}

export function MiniCRM() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    origin_store_name: '',
    status: 'new',
    source: 'manual',
  })

  const loadData = async () => {
    try {
      const records = await pb.collection('customers').getFullList<Customer>({
        filter:
          "source = 'whatsapp' || source = 'instagram' || source = 'email' || source = 'site' || source = 'manual'",
        sort: '-created',
      })
      setCustomers(records)
    } catch (err) {
      toast.error('Erro ao carregar leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', () => {
    loadData()
  })

  const validStatusCustomers = customers.filter((c) =>
    ['new', 'contact', 'negotiation', 'closed'].includes(c.status),
  )
  const totalLeads = validStatusCustomers.length

  const counts = {
    new: validStatusCustomers.filter((c) => c.status === 'new').length,
    contact: validStatusCustomers.filter((c) => c.status === 'contact').length,
    negotiation: validStatusCustomers.filter((c) => c.status === 'negotiation').length,
    closed: validStatusCustomers.filter((c) => c.status === 'closed').length,
  }

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const closedThisMonth = validStatusCustomers.filter((c) => {
    if (c.status !== 'closed') return false
    const dateStr = c.last_action_date || c.updated
    if (!dateStr) return false
    const date = new Date(dateStr)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }).length

  const handleSave = async () => {
    if (!formData.name) return toast.error('Nome do contato é obrigatório')
    try {
      const dataToSave = {
        ...formData,
        last_action_date: new Date().toISOString(),
        manufacturer: pb.authStore.record?.id,
      }

      if (editingCustomer) {
        await pb.collection('customers').update(editingCustomer.id, dataToSave)
        toast.success('Lead atualizado')
      } else {
        await pb.collection('customers').create(dataToSave)
        toast.success('Lead adicionado')
      }
      setIsNewOpen(false)
      setEditingCustomer(null)
      setFormData({
        name: '',
        phone: '',
        origin_store_name: '',
        status: 'new',
        source: 'manual',
      })
      loadData()
    } catch (err) {
      toast.error('Erro ao salvar lead')
    }
  }

  const handleAdvanceStatus = async (customer: Customer) => {
    const current = statusMap[customer.status]
    if (!current || !current.next) return

    try {
      await pb.collection('customers').update(customer.id, {
        status: current.next,
        last_action_date: new Date().toISOString(),
      })
      toast.success('Status avançado com sucesso')
      loadData()
    } catch (err) {
      toast.error('Erro ao atualizar status')
    }
  }

  const openEdit = (c: Customer) => {
    setEditingCustomer(c)
    setFormData({
      name: c.name,
      phone: c.phone,
      origin_store_name: c.origin_store_name,
      status: c.status,
      source: c.source,
    })
    setIsNewOpen(true)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm')
    } catch {
      return '-'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">CRM de Leads</h2>
          <p className="text-muted-foreground text-sm">
            Acompanhe suas vendas e conversões pelo funil.
          </p>
        </div>
        <Dialog
          open={isNewOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditingCustomer(null)
              setFormData({
                name: '',
                phone: '',
                origin_store_name: '',
                status: 'new',
                source: 'manual',
              })
            }
            setIsNewOpen(open)
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Marca (Nome da Loja)</Label>
                <Input
                  value={formData.origin_store_name || ''}
                  onChange={(e) => setFormData({ ...formData, origin_store_name: e.target.value })}
                  placeholder="Ex: Boutique da Moda"
                />
              </div>
              <div className="space-y-2">
                <Label>Nome do Contato</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Maria Silva"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ex: 11999999999"
                />
              </div>
              {!editingCustomer && (
                <div className="space-y-2">
                  <Label>Origem</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(v) => setFormData({ ...formData, source: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="site">Site/Landing Page</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-2"
                onClick={handleSave}
              >
                Salvar Lead
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl flex flex-col items-center justify-center text-center">
          <Users className="h-5 w-5 text-orange-500 mb-2" />
          <span className="text-2xl font-bold">{totalLeads}</span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Total Leads
          </span>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl flex flex-col items-center justify-center text-center">
          <div className="h-4 w-4 rounded-full bg-blue-500 mb-2" />
          <span className="text-2xl font-bold">{counts.new}</span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Novos
          </span>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl flex flex-col items-center justify-center text-center">
          <PhoneCall className="h-5 w-5 text-yellow-500 mb-2" />
          <span className="text-2xl font-bold">{counts.contact}</span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Em Contato
          </span>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl flex flex-col items-center justify-center text-center">
          <Handshake className="h-5 w-5 text-orange-500 mb-2" />
          <span className="text-2xl font-bold">{counts.negotiation}</span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Venda Iniciada
          </span>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl flex flex-col items-center justify-center text-center">
          <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
          <span className="text-2xl font-bold">{counts.closed}</span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Fechadas
          </span>
        </div>
        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-xl flex flex-col items-center justify-center text-center">
          <TrendingUp className="h-5 w-5 text-orange-600 mb-2" />
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {closedThisMonth}
          </span>
          <span className="text-xs text-orange-600/80 dark:text-orange-400/80 font-medium uppercase tracking-wider mt-1">
            Fechadas no Mês
          </span>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Marca</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Status do Funil</TableHead>
              <TableHead>Última Ação</TableHead>
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
            ) : validStatusCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum lead encontrado neste funil.
                </TableCell>
              </TableRow>
            ) : (
              validStatusCustomers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.origin_store_name || c.name || '-'}
                  </TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.phone || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {sourceMap[c.source] || c.source || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${statusMap[c.status]?.color || 'bg-gray-500'} border-transparent hover:opacity-90 transition-opacity`}
                    >
                      {statusMap[c.status]?.label || c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(c.last_action_date || c.updated)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {statusMap[c.status]?.next && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950 h-8"
                          onClick={() => handleAdvanceStatus(c)}
                        >
                          Avançar <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
