import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Calendar, MapPin, Users } from 'lucide-react'
import { getExcursoes, createExcursao, type Excursao } from '@/services/excursoes'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { toast as sonnerToast } from 'sonner'

const HUB_LABELS: Record<string, string> = {
  '44_goiania': '44 Goiânia',
  fama_goiania: 'Fama Goiânia',
  bras_sp: 'Brás SP',
  bom_retiro_sp: 'Bom Retiro SP',
  outros: 'Outros',
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendada',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  canceled: 'Cancelada',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  scheduled: 'secondary',
  in_progress: 'default',
  completed: 'outline',
  canceled: 'destructive',
}

export function AgentExcursions() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [excursoes, setExcursoes] = useState<Excursao[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    departure_date: '',
    return_date: '',
    origin_city: '',
    destination_city: '',
    origin_hub: '',
    destination_hub: '',
    notes: '',
  })

  const loadData = async () => {
    try {
      const data = await getExcursoes(user?.id)
      setExcursoes(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) loadData()
  }, [user?.id])

  useRealtime('excursoes', () => loadData())

  const handleCreate = async () => {
    if (!form.title || !form.departure_date || !form.origin_city || !form.destination_city) {
      sonnerToast.error('Preencha todos os campos obrigatórios.')
      return
    }
    try {
      await createExcursao({
        agent: user?.id,
        title: form.title,
        departure_date: form.departure_date,
        return_date: form.return_date || undefined,
        origin_city: form.origin_city,
        destination_city: form.destination_city,
        origin_hub: form.origin_hub || undefined,
        destination_hub: form.destination_hub || undefined,
        status: 'scheduled',
        notes: form.notes || undefined,
      })
      sonnerToast.success('Excursão criada com sucesso!')
      setIsOpen(false)
      setForm({
        title: '',
        departure_date: '',
        return_date: '',
        origin_city: '',
        destination_city: '',
        origin_hub: '',
        destination_hub: '',
        notes: '',
      })
      loadData()
    } catch (err) {
      sonnerToast.error('Erro ao criar excursão.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Excursões de Compras</h3>
          <p className="text-sm text-muted-foreground">Gerencie viagens e passageiros.</p>
        </div>
        <Button className="bg-electric text-electric-foreground" onClick={() => setIsOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nova Excursão
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Carregando...</p>
        ) : excursoes.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">
            Nenhuma excursão registrada. Crie a primeira!
          </p>
        ) : (
          excursoes.map((exc) => (
            <Card key={exc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{exc.title}</CardTitle>
                  <Badge variant={STATUS_VARIANTS[exc.status] || 'secondary'}>
                    {STATUS_LABELS[exc.status] || exc.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(exc.departure_date).toLocaleDateString('pt-BR')}
                  {exc.return_date && ` → ${new Date(exc.return_date).toLocaleDateString('pt-BR')}`}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {exc.origin_city} → {exc.destination_city}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {exc.expand?.customers?.length || exc.customers?.length || 0} cliente(s)
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Excursão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Excursão Goiânia - Brás"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Saída *</Label>
                <Input
                  type="date"
                  value={form.departure_date}
                  onChange={(e) => setForm({ ...form, departure_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Retorno</Label>
                <Input
                  type="date"
                  value={form.return_date}
                  onChange={(e) => setForm({ ...form, return_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cidade de Origem *</Label>
                <Input
                  value={form.origin_city}
                  onChange={(e) => setForm({ ...form, origin_city: e.target.value })}
                  placeholder="Ex: Goiânia"
                />
              </div>
              <div className="space-y-2">
                <Label>Cidade de Destino *</Label>
                <Input
                  value={form.destination_city}
                  onChange={(e) => setForm({ ...form, destination_city: e.target.value })}
                  placeholder="Ex: São Paulo"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Polo de Origem</Label>
                <Select
                  value={form.origin_hub}
                  onValueChange={(v) => setForm({ ...form, origin_hub: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(HUB_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Polo de Destino</Label>
                <Select
                  value={form.destination_hub}
                  onValueChange={(v) => setForm({ ...form, destination_hub: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(HUB_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notas sobre a viagem..."
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-electric text-electric-foreground" onClick={handleCreate}>
              Criar Excursão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
