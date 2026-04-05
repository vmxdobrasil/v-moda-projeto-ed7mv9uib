import { useState, useEffect } from 'react'
import { getCustomers, updateCustomer, createCustomer, Customer } from '@/services/customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Pencil } from 'lucide-react'

export function MiniCRM() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    status: 'new',
    logistics_status: 'Aguardando Ônibus',
    notes: '',
  })

  const loadData = async () => {
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (err) {
      toast.error('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    if (!formData.name) return toast.error('Nome é obrigatório')
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData)
        toast.success('Cliente atualizado')
      } else {
        await createCustomer(formData)
        toast.success('Cliente adicionado')
      }
      setIsNewOpen(false)
      setEditingCustomer(null)
      setFormData({
        name: '',
        phone: '',
        status: 'new',
        logistics_status: 'Aguardando Ônibus',
        notes: '',
      })
      loadData()
    } catch (err) {
      toast.error('Erro ao salvar')
    }
  }

  const openEdit = (c: Customer) => {
    setEditingCustomer(c)
    setFormData({
      name: c.name,
      phone: c.phone,
      status: c.status,
      logistics_status: c.logistics_status,
      notes: c.notes,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Meus Clientes</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe suas vendas, interessados e logística.
          </p>
        </div>
        <Dialog
          open={isNewOpen || !!editingCustomer}
          onOpenChange={(open) => {
            if (!open) {
              setIsNewOpen(false)
              setEditingCustomer(null)
              setFormData({
                name: '',
                phone: '',
                status: 'new',
                logistics_status: 'Aguardando Ônibus',
                notes: '',
              })
            } else setIsNewOpen(true)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status da Venda</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as any })}
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
                  <Label>Logística</Label>
                  <Select
                    value={formData.logistics_status || ''}
                    onValueChange={(v) => setFormData({ ...formData, logistics_status: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aguardando Ônibus">Aguardando Ônibus</SelectItem>
                      <SelectItem value="Em Trânsito no Ônibus">Em Trânsito no Ônibus</SelectItem>
                      <SelectItem value="Entregue">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Anotações Gerais</Label>
                <Textarea
                  placeholder="Medidas, preferências de peça, etc."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <Button className="w-full mt-2" onClick={handleSave}>
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-lg bg-card overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Logística</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum cliente cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={c.status === 'converted' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{c.logistics_status || '-'}</TableCell>
                  <TableCell
                    className="text-sm text-muted-foreground max-w-[150px] truncate"
                    title={c.notes}
                  >
                    {c.notes || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Button>
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
