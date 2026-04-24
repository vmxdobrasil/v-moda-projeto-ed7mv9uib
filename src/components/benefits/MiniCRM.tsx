import { useState, useEffect } from 'react'
import { getCustomers, updateCustomer, createCustomer, type Customer } from '@/services/customers'
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
import { Plus, Pencil, MessageCircle, QrCode } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

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
    seat_number: undefined,
    active_route: '',
    freight_value: undefined,
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

  useRealtime('customers', () => {
    loadData()
  })

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
        seat_number: undefined,
        active_route: '',
        freight_value: undefined,
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
      seat_number: c.seat_number,
      active_route: c.active_route,
      freight_value: c.freight_value,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Meus Clientes</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe suas vendas, interessados e detalhes de logística.
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
                seat_number: undefined,
                active_route: '',
                freight_value: undefined,
              })
            } else setIsNewOpen(true)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
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
                  <Label>Status de Logística</Label>
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
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Poltrona</Label>
                  <Input
                    type="number"
                    value={formData.seat_number || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seat_number: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="Ex: 12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rota</Label>
                  <Input
                    value={formData.active_route || ''}
                    onChange={(e) => setFormData({ ...formData, active_route: e.target.value })}
                    placeholder="Ex: SP-GO"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Frete (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.freight_value || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        freight_value: parseFloat(e.target.value) || undefined,
                      })
                    }
                    placeholder="Ex: 50.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Anotações Gerais (Preferências, medidas, etc.)</Label>
                <Textarea
                  placeholder="Medidas, preferências de peça, etc."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              {editingCustomer && editingCustomer.seat_number && (
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border mt-4">
                  <p className="text-sm font-medium mb-2">QR Code de Embarque</p>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ id: editingCustomer.id, seat: editingCustomer.seat_number, route: editingCustomer.active_route }))}`}
                    alt="QR Code"
                    className="w-32 h-32 rounded-lg bg-white p-2 border shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Apresente no embarque para check-in rápido.
                  </p>
                </div>
              )}
              <Button className="w-full mt-4" onClick={handleSave}>
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-lg bg-card overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Logística & Rota</TableHead>
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
                  <TableCell>
                    <div className="text-sm">{c.logistics_status || '-'}</div>
                    {(c.active_route || c.seat_number || c.freight_value) && (
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                        {c.active_route && (
                          <span className="bg-muted px-1.5 rounded">{c.active_route}</span>
                        )}
                        {c.seat_number && (
                          <span className="bg-muted px-1.5 rounded">Poltrona {c.seat_number}</span>
                        )}
                        {c.freight_value && (
                          <span className="bg-muted px-1.5 rounded">R$ {c.freight_value}</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-sm text-muted-foreground max-w-[200px] truncate"
                    title={c.notes}
                  >
                    {c.notes || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          try {
                            await pb.send(`/backend/v1/whatsapp/notify/${c.id}`, { method: 'POST' })
                            toast.success('Notificação enviada com sucesso!')
                          } catch (e) {
                            toast.error('Erro ao enviar notificação')
                          }
                        }}
                        title="Notificar via WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => (window.location.href = `/manufacturer/negotiation/${c.id}`)}
                        title="Open Negotiation Hub"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-500"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                          <path d="m9 15 2 2 4-4" />
                        </svg>
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
