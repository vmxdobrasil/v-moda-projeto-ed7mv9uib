import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, Edit2, Trash2, Phone, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import {
  Customer,
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '@/services/customers'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    status: 'new',
    source: 'manual',
    notes: '',
  })

  const loadData = async () => {
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao carregar clientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', loadData)

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        status: customer.status || 'new',
        source: customer.source || 'manual',
        notes: customer.notes || '',
      })
    } else {
      setEditingCustomer(null)
      setFormData({
        name: '',
        phone: '',
        email: '',
        status: 'new',
        source: 'manual',
        notes: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('O nome do cliente é obrigatório.')
      return
    }

    try {
      const dataToSave = {
        ...formData,
        last_contacted_at: new Date().toISOString(),
      }

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, dataToSave)
        toast.success('Cliente atualizado com sucesso!')
      } else {
        await createCustomer(dataToSave)
        toast.success('Cliente adicionado com sucesso!')
      }
      setIsModalOpen(false)
    } catch (err: any) {
      toast.error('Erro ao salvar os dados do cliente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este cliente permanentemente?')) {
      try {
        await deleteCustomer(id)
        toast.success('Cliente removido.')
      } catch (err) {
        toast.error('Erro ao remover cliente.')
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Novo</Badge>
      case 'interested':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Interessado</Badge>
      case 'negotiating':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Negociando</Badge>
      case 'converted':
        return <Badge className="bg-green-500 hover:bg-green-600">Convertido</Badge>
      case 'inactive':
        return (
          <Badge variant="outline" className="text-gray-500">
            Inativo
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="capitalize">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clientes / CRM</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie seus leads, status de vendas e histórico de interações.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">Sua Base de Clientes</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone ou email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status da Venda</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Último Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Carregando clientes...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Nenhum cliente encontrado. Adicione novos leads para começar.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          {customer.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" /> {customer.phone}
                            </span>
                          )}
                          {customer.email && (
                            <span className="truncate max-w-[150px]">{customer.email}</span>
                          )}
                          {!customer.phone && !customer.email && <span>-</span>}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status || 'new')}</TableCell>
                      <TableCell className="capitalize">
                        {customer.source?.replace('_', ' ') || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {customer.last_contacted_at ? (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(customer.last_contacted_at), 'dd/MM/yyyy')}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(customer)}
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(customer.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Editar Detalhes do Cliente' : 'Adicionar Novo Lead'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? 'Atualize os dados, anotações e o status atual da negociação.'
                : 'Cadastre um novo lead para acompanhar na sua base do CRM.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>
                Nome Completo <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Maria Oliveira"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Telefone / WhatsApp</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="grid gap-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="cliente@exemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status da Venda</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: any) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo Lead</SelectItem>
                    <SelectItem value="interested">Interessado</SelectItem>
                    <SelectItem value="negotiating">Em Negociação</SelectItem>
                    <SelectItem value="converted">Convertido (Cliente)</SelectItem>
                    <SelectItem value="inactive">Inativo / Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Canal de Origem</Label>
                <Select
                  value={formData.source}
                  onValueChange={(v: any) => setFormData({ ...formData, source: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="site">Site / Plataforma</SelectItem>
                    <SelectItem value="whatsapp_group">Grupo VIP</SelectItem>
                    <SelectItem value="manual">Cadastro Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Anotações Privadas (Visível apenas para você)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ex: Cliente tem preferência por peças Plus Size. Entrar em contato na próxima terça."
                className="resize-none"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
