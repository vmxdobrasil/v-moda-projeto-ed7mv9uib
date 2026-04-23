import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Truck, Pencil, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import { Textarea } from '@/components/ui/textarea'

export default function Logistics() {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingDelivery, setEditingDelivery] = useState<any | null>(null)

  const loadData = async () => {
    try {
      const user = pb.authStore.record
      if (!user) return

      const filterList = ['logistics_status != ""']
      if (user.role !== 'admin' && user.email !== 'valterpmendonca@gmail.com') {
        filterList.push(`(manufacturer = "${user.id}" || affiliate_referrer = "${user.id}")`)
      }

      const records = await pb.collection('customers').getFullList({
        filter: filterList.join(' && '),
        sort: '-updated',
      })
      setDeliveries(records)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao carregar entregas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', () => loadData())

  const handleUpdate = async () => {
    if (!editingDelivery) return
    try {
      await pb.collection('customers').update(editingDelivery.id, {
        logistics_status: editingDelivery.logistics_status,
        caravan_name: editingDelivery.caravan_name,
        active_route: editingDelivery.active_route,
        freight_value: editingDelivery.freight_value,
        seat_number: editingDelivery.seat_number,
        logistics_notes: editingDelivery.logistics_notes,
      })
      toast.success('Informações de logística atualizadas')
      setEditingDelivery(null)
    } catch (e) {
      toast.error('Erro ao atualizar logística')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logística</h1>
        <p className="text-muted-foreground">
          Acompanhe as entregas, fretes e caravanas dos seus clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aguardando Ônibus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deliveries.filter((d) => d.logistics_status === 'Aguardando Ônibus').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Trânsito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deliveries.filter((d) => d.logistics_status === 'Em Trânsito no Ônibus').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entregues (Sucesso)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deliveries.filter((d) => d.logistics_status === 'Entregue').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rota / Caravana</TableHead>
              <TableHead>Poltrona</TableHead>
              <TableHead>Frete (R$)</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Truck className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                  Nenhuma entrega com logística ativa.
                  <br />
                  Ative a logística no perfil do lead (CRM) para acompanhar aqui.
                </TableCell>
              </TableRow>
            ) : (
              deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.name}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        delivery.logistics_status === 'Aguardando Ônibus'
                          ? 'bg-yellow-100 text-yellow-800'
                          : delivery.logistics_status === 'Em Trânsito no Ônibus'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {delivery.logistics_status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />{' '}
                        {delivery.active_route || '-'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {delivery.caravan_name || 'Sem caravana'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{delivery.seat_number ? `#${delivery.seat_number}` : '-'}</TableCell>
                  <TableCell>
                    {delivery.freight_value ? `R$ ${delivery.freight_value.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditingDelivery(delivery)}>
                      <Pencil className="w-4 h-4 mr-2" /> Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingDelivery} onOpenChange={(open) => !open && setEditingDelivery(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Logística - {editingDelivery?.name}</DialogTitle>
          </DialogHeader>
          {editingDelivery && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editingDelivery.logistics_status}
                  onValueChange={(v) =>
                    setEditingDelivery({ ...editingDelivery, logistics_status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aguardando Ônibus">Aguardando Ônibus</SelectItem>
                    <SelectItem value="Em Trânsito no Ônibus">Em Trânsito no Ônibus</SelectItem>
                    <SelectItem value="Entregue">Entregue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Caravana</Label>
                  <Input
                    value={editingDelivery.caravan_name || ''}
                    onChange={(e) =>
                      setEditingDelivery({ ...editingDelivery, caravan_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rota</Label>
                  <Input
                    value={editingDelivery.active_route || ''}
                    onChange={(e) =>
                      setEditingDelivery({ ...editingDelivery, active_route: e.target.value })
                    }
                    placeholder="Ex: Goiânia - SP"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Poltrona / Assento</Label>
                  <Input
                    type="number"
                    value={editingDelivery.seat_number || ''}
                    onChange={(e) =>
                      setEditingDelivery({
                        ...editingDelivery,
                        seat_number: parseInt(e.target.value) || null,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor do Frete (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingDelivery.freight_value || ''}
                    onChange={(e) =>
                      setEditingDelivery({
                        ...editingDelivery,
                        freight_value: parseFloat(e.target.value) || null,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações Logísticas</Label>
                <Textarea
                  value={editingDelivery.logistics_notes || ''}
                  onChange={(e) =>
                    setEditingDelivery({ ...editingDelivery, logistics_notes: e.target.value })
                  }
                  placeholder="Instruções para o motorista ou guia..."
                  className="resize-none"
                />
              </div>
              <Button className="w-full mt-4" onClick={handleUpdate}>
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
