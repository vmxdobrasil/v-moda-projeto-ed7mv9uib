import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
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
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { MapPin, Truck, Pencil, Loader2 } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'

export default function ManufacturerLogistics() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingDelivery, setEditingDelivery] = useState<any | null>(null)

  const loadData = async () => {
    try {
      if (!user) return
      const records = await pb.collection('customers').getFullList({
        filter: `manufacturer = "${user.id}" && (logistics_status != "" || shipping_method != "")`,
        sort: '-updated',
      })
      setCustomers(records)
    } catch (error) {
      console.error('Error loading logistics', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('customers', () => loadData())

  const handleUpdate = async () => {
    if (!editingDelivery) return
    setIsSaving(true)
    try {
      const data: any = {
        shipping_method: editingDelivery.shipping_method || '',
        logistics_status: editingDelivery.logistics_status || '',
        caravan_name: editingDelivery.caravan_name || '',
        active_route: editingDelivery.active_route || '',
        tracking_code: editingDelivery.tracking_code || '',
        shipping_date: editingDelivery.shipping_date || null,
        freight_value: editingDelivery.freight_value || null,
        freight_payer: editingDelivery.freight_payer || '',
        seat_number: editingDelivery.seat_number || null,
      }

      await pb.collection('customers').update(editingDelivery.id, data)
      toast.success('Informações de logística atualizadas')
      setEditingDelivery(null)
      loadData()
    } catch (e) {
      toast.error('Erro ao atualizar logística')
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aguardando Ônibus':
      case 'Aguardando Envio':
        return 'bg-yellow-100 text-yellow-800'
      case 'Em Trânsito no Ônibus':
      case 'Em Trânsito':
      case 'Postado':
        return 'bg-blue-100 text-blue-800'
      case 'Entregue':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPayer = (payer?: string) => {
    if (payer === 'manufacturer') return 'Fabricante'
    if (payer === 'retailer') return 'Loja/Revendedora'
    return '-'
  }

  const formatShippingMethod = (method: string) => {
    switch (method) {
      case 'transportadora':
        return 'Transportadora'
      case 'correios':
        return 'Correios'
      case 'caravana_onibus':
        return 'Caravana/Ônibus'
      default:
        return '-'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Logística e Entregas</h2>
        <p className="text-muted-foreground">
          Acompanhe as rotas, caravanas e status de entrega dos seus clientes.
        </p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clientes</TableHead>
                <TableHead>Método de Envio</TableHead>
                <TableHead>Status Logístico</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Pagador do Frete</TableHead>
                <TableHead>Valor do Frete</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Truck className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                    Nenhum cliente com logística ativa.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => {
                  const freightValue = c.freight_value || 0

                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{formatShippingMethod(c.shipping_method)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            c.logistics_status,
                          )}`}
                        >
                          {c.logistics_status || 'Pendente'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {c.shipping_method === 'transportadora' ||
                        c.shipping_method === 'correios' ? (
                          <div className="flex flex-col gap-1">
                            {c.tracking_code ? (
                              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded w-fit">
                                {c.tracking_code}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Sem rastreio</span>
                            )}
                            {c.shipping_date && (
                              <span className="text-xs text-muted-foreground">
                                Enviado em:{' '}
                                {new Date(c.shipping_date).toLocaleDateString('pt-BR', {
                                  timeZone: 'UTC',
                                })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-muted-foreground" />{' '}
                              {c.active_route || '-'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {c.caravan_name || 'Sem caravana'}
                              {c.seat_number ? ` • Poltrona #${c.seat_number}` : ''}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted">
                          {formatPayer(c.freight_payer)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {freightValue > 0 ? `R$ ${freightValue.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditingDelivery(c)}>
                          <Pencil className="w-4 h-4 mr-2" /> Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingDelivery} onOpenChange={(open) => !open && setEditingDelivery(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Logística - {editingDelivery?.name}</DialogTitle>
          </DialogHeader>
          {editingDelivery && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Método de Envio</Label>
                  <Select
                    value={editingDelivery.shipping_method || ''}
                    onValueChange={(v) =>
                      setEditingDelivery({
                        ...editingDelivery,
                        shipping_method: v,
                        logistics_status: '',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transportadora">Transportadora</SelectItem>
                      <SelectItem value="correios">Correios</SelectItem>
                      <SelectItem value="caravana_onibus">Caravana / Ônibus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status Logístico</Label>
                  <Select
                    value={editingDelivery.logistics_status || ''}
                    onValueChange={(v) =>
                      setEditingDelivery({ ...editingDelivery, logistics_status: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {editingDelivery.shipping_method === 'caravana_onibus' ? (
                        <>
                          <SelectItem value="Aguardando Ônibus">Aguardando Ônibus</SelectItem>
                          <SelectItem value="Em Trânsito no Ônibus">
                            Em Trânsito no Ônibus
                          </SelectItem>
                          <SelectItem value="Entregue">Entregue</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Aguardando Envio">Aguardando Envio</SelectItem>
                          <SelectItem value="Postado">Postado</SelectItem>
                          <SelectItem value="Em Trânsito">Em Trânsito</SelectItem>
                          <SelectItem value="Entregue">Entregue</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {editingDelivery.shipping_method === 'caravana_onibus' && (
                  <>
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
                  </>
                )}

                {(editingDelivery.shipping_method === 'transportadora' ||
                  editingDelivery.shipping_method === 'correios') && (
                  <>
                    <div className="space-y-2">
                      <Label>Código de Rastreio</Label>
                      <Input
                        value={editingDelivery.tracking_code || ''}
                        onChange={(e) =>
                          setEditingDelivery({ ...editingDelivery, tracking_code: e.target.value })
                        }
                        placeholder="Ex: BR123456789BR"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Envio</Label>
                      <Input
                        type="date"
                        value={
                          editingDelivery.shipping_date
                            ? new Date(editingDelivery.shipping_date).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) => {
                          const dateVal = e.target.value
                          setEditingDelivery({
                            ...editingDelivery,
                            shipping_date: dateVal ? `${dateVal} 12:00:00.000Z` : null,
                          })
                        }}
                      />
                    </div>
                  </>
                )}

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

                <div className="space-y-2">
                  <Label>Responsável pelo Frete</Label>
                  <Select
                    value={editingDelivery.freight_payer || ''}
                    onValueChange={(v) =>
                      setEditingDelivery({
                        ...editingDelivery,
                        freight_payer: v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturer">Fabricante</SelectItem>
                      <SelectItem value="retailer">Loja/Revendedora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={handleUpdate} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
