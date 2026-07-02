import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Package, QrCode, Copy } from 'lucide-react'
import {
  getCargas,
  createCarga,
  updateCarga,
  type CargaTransporte,
} from '@/services/cargas-transporte'
import { getExcursoes } from '@/services/excursoes'
import { useRealtime } from '@/hooks/use-realtime'
import { toast as sonnerToast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  collected: 'Coletado',
  in_transit: 'Em Trânsito',
  delivered: 'Entregue',
  issue: 'Problema',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  collected: 'outline',
  in_transit: 'default',
  delivered: 'default',
  issue: 'destructive',
}

export function AgentCargoControl() {
  const { user } = useAuth()
  const [cargas, setCargas] = useState<CargaTransporte[]>([])
  const [excursoes, setExcursoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({
    description: '',
    volume_count: '',
    weight_kg: '',
    pickup_address: '',
    excursion: '',
  })

  const loadData = async () => {
    try {
      const [cargaData, excData] = await Promise.all([getCargas(user?.id), getExcursoes(user?.id)])
      setCargas(cargaData)
      setExcursoes(excData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) loadData()
  }, [user?.id])

  useRealtime('cargas_transporte', () => loadData())

  const handleCreate = async () => {
    if (!form.description) {
      sonnerToast.error('Descrição é obrigatória.')
      return
    }
    try {
      await createCarga({
        agent: user?.id,
        description: form.description,
        volume_count: form.volume_count ? parseInt(form.volume_count) : undefined,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        pickup_address: form.pickup_address || undefined,
        excursion: form.excursion || undefined,
        delivery_status: 'pending',
      })
      sonnerToast.success('Carga registrada!')
      setIsOpen(false)
      setForm({
        description: '',
        volume_count: '',
        weight_kg: '',
        pickup_address: '',
        excursion: '',
      })
      loadData()
    } catch (err) {
      sonnerToast.error('Erro ao registrar carga.')
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateCarga(id, { delivery_status: status as any })
      sonnerToast.success('Status atualizado!')
      loadData()
    } catch (err) {
      sonnerToast.error('Erro ao atualizar.')
    }
  }

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token)
    sonnerToast.success('Token copiado!')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Controle de Cargas</h3>
          <p className="text-sm text-muted-foreground">Registre volumes e acompanhe entregas.</p>
        </div>
        <Button
          className="bg-electric text-electric-foreground rounded-xl h-12 px-6 text-base cta-glow"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="h-5 w-5 mr-2" /> Nova Carga
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-navy text-navy-foreground">
                <TableHead className="text-navy-foreground">Descrição</TableHead>
                <TableHead className="text-navy-foreground">Volumes</TableHead>
                <TableHead className="text-navy-foreground">Peso (kg)</TableHead>
                <TableHead className="text-navy-foreground">Status</TableHead>
                <TableHead className="text-navy-foreground">QR Token</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : cargas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                    Nenhuma carga registrada.
                  </TableCell>
                </TableRow>
              ) : (
                cargas.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium max-w-xs">
                      {c.description || '-'}
                      {c.pickup_address && (
                        <div className="text-xs text-muted-foreground">{c.pickup_address}</div>
                      )}
                    </TableCell>
                    <TableCell>{c.volume_count || '-'}</TableCell>
                    <TableCell>{c.weight_kg || '-'}</TableCell>
                    <TableCell>
                      <Select
                        value={c.delivery_status}
                        onValueChange={(v) => handleStatusChange(c.id, v)}
                      >
                        <SelectTrigger className="w-36 h-8">
                          <Badge variant={STATUS_VARIANTS[c.delivery_status] || 'secondary'}>
                            {STATUS_LABELS[c.delivery_status] || c.delivery_status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {c.qr_code_token ? (
                        <div className="flex items-center gap-1">
                          <QrCode className="h-4 w-4 text-primary" />
                          <span className="text-xs font-mono truncate max-w-[80px]">
                            {c.qr_code_token.substring(0, 8)}...
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => copyToken(c.qr_code_token!)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nova Carga</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: 15 peças moda feminina"
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nº de Volumes</Label>
                <Input
                  type="number"
                  value={form.volume_count}
                  onChange={(e) => setForm({ ...form, volume_count: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Peso Total (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.weight_kg}
                  onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Endereço de Coleta</Label>
              <Input
                value={form.pickup_address}
                onChange={(e) => setForm({ ...form, pickup_address: e.target.value })}
                placeholder="Ex: Galpão Fabricante - Brás SP"
              />
            </div>
            {excursoes.length > 0 && (
              <div className="space-y-2">
                <Label>Excursão Associada</Label>
                <Select
                  value={form.excursion}
                  onValueChange={(v) => setForm({ ...form, excursion: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {excursoes.map((exc) => (
                      <SelectItem key={exc.id} value={exc.id}>
                        {exc.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl h-11" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-electric text-electric-foreground rounded-xl h-11 cta-glow"
              onClick={handleCreate}
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
