import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { createPedidoRevenda } from '@/services/pedidos-revenda'
import { toast } from 'sonner'

export function CreateOrderDialog({
  revendedoraId,
  products,
}: {
  revendedoraId: string
  products: any[]
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    project: '',
    type: 'wholesale' as 'wholesale' | 'dropshipping',
    quantity: 1,
    client_name: '',
    client_phone: '',
    client_address: '',
  })

  const selectedProduct = products.find((p) => p.id === form.project)

  const handleSubmit = async () => {
    if (!form.project || !selectedProduct) return
    setLoading(true)
    try {
      const unitPrice = selectedProduct.wholesale_price || selectedProduct.price || 0
      const total = unitPrice * form.quantity
      const profit = total * 0.3
      await createPedidoRevenda({
        ...form,
        revendedora: revendedoraId,
        unit_price: unitPrice,
        total_amount: total,
        profit,
        points_earned: Math.floor(total),
        status: 'pending',
      })
      toast.success('Pedido criado com sucesso!')
      setOpen(false)
      setForm({
        project: '',
        type: 'wholesale',
        quantity: 1,
        client_name: '',
        client_phone: '',
        client_address: '',
      })
    } catch {
      toast.error('Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-electric hover:bg-electric/90 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Novo Pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Produto *</Label>
            <Select value={form.project} onValueChange={(v) => setForm({ ...form, project: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Pedido *</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v as 'wholesale' | 'dropshipping' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wholesale">Atacado (estoque)</SelectItem>
                <SelectItem value="dropshipping">Dropshipping (direto p/ cliente)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade *</Label>
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            {form.type === 'dropshipping' && (
              <div className="space-y-2">
                <Label>Nome do Cliente</Label>
                <Input
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  placeholder="Nome"
                />
              </div>
            )}
          </div>
          {form.type === 'dropshipping' && (
            <div className="space-y-2">
              <Label>Telefone do Cliente</Label>
              <Input
                value={form.client_phone}
                onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
          )}
          {selectedProduct && (
            <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Preço unitário:</span>
                <span className="font-medium">
                  R$ {(selectedProduct.wholesale_price || selectedProduct.price || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold text-primary">
                  R${' '}
                  {(
                    (selectedProduct.wholesale_price || selectedProduct.price || 0) * form.quantity
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Lucro estimado:</span>
                <span className="font-bold">
                  R${' '}
                  {(
                    (selectedProduct.wholesale_price || selectedProduct.price || 0) *
                    form.quantity *
                    0.3
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          )}
          <Button
            onClick={handleSubmit}
            disabled={loading || !form.project}
            className="w-full bg-electric hover:bg-electric/90 text-white"
          >
            {loading ? 'Criando...' : 'Criar Pedido'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
