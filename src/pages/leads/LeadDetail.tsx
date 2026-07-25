import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getLead,
  updateLeadStatus,
  updateLeadNotes,
  type LeadCollection,
} from '@/services/unified-leads'
import { logActivity } from '@/services/activity-logs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'

const STATUS_OPTIONS: Record<string, { value: string; label: string }[]> = {
  leads_venda: [
    { value: 'pending', label: 'Pendente' },
    { value: 'contacted', label: 'Contatado' },
    { value: 'converted', label: 'Convertido' },
    { value: 'closed', label: 'Fechado' },
  ],
  leads_fabricantes: [
    { value: 'pending', label: 'Pendente' },
    { value: 'contacted', label: 'Contatado' },
    { value: 'approved', label: 'Aprovado' },
    { value: 'rejected', label: 'Rejeitado' },
  ],
  leads_retailers: [
    { value: 'pending', label: 'Pendente' },
    { value: 'contacted', label: 'Contatado' },
    { value: 'approved', label: 'Aprovado' },
    { value: 'rejected', label: 'Rejeitado' },
  ],
}

const COLLECTION_LABELS: Record<string, string> = {
  leads_venda: 'Vendas',
  leads_fabricantes: 'Fabricantes',
  leads_retailers: 'Retailers',
}

const SKIP_FIELDS = ['id', 'created', 'updated', 'collectionName', 'expand', 'avatar']

export default function LeadDetail() {
  const { collection, id } = useParams<{ collection: string; id: string }>()
  const navigate = useNavigate()
  const [record, setRecord] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [activities, setActivities] = useState<any[]>([])

  const col = (collection as LeadCollection) || 'leads_fabricantes'

  const loadData = async () => {
    if (!id) return
    try {
      const { record: rec } = await getLead(col, id)
      setRecord(rec)
      setNotes(rec.notes || '')
      try {
        const acts = await pb.collection('activity_logs').getList(1, 10, {
          sort: '-created',
          filter: `metadata.lead_id = "${id}"`,
        })
        setActivities(acts.items)
      } catch {
        setActivities([])
      }
    } catch {
      toast.error('Lead não encontrado')
      navigate('/leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id, collection])
  useRealtime(col, loadData)

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !record) return
    const oldStatus = record.status
    try {
      await updateLeadStatus(col, id, newStatus)
      setRecord({ ...record, status: newStatus })
      await logActivity(
        'lead_status_change',
        `Status alterado de "${oldStatus}" para "${newStatus}"`,
        {
          lead_id: id,
          collection: col,
          old_status: oldStatus,
          new_status: newStatus,
        },
      )
      toast.success('Status atualizado!')
    } catch {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleSaveNotes = async () => {
    if (!id) return
    setSaving(true)
    try {
      await updateLeadNotes(col, id, notes)
      await logActivity('lead_notes_update', 'Notas atualizadas', { lead_id: id, collection: col })
      toast.success('Notas salvas!')
    } catch {
      toast.error('Erro ao salvar notas')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="py-20 text-center text-muted-foreground">Carregando...</div>
  if (!record) return null

  const fields = Object.entries(record)
    .filter(([k]) => !SKIP_FIELDS.includes(k))
    .filter(([, v]) => v !== null && v !== undefined && v !== '')

  const displayName =
    record.name ||
    record.store_name ||
    record.contact_name ||
    record.message?.substring(0, 50) ||
    'Lead'

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leads')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{displayName}</h1>
          <Badge variant="outline" className="mt-1">
            {COLLECTION_LABELS[col] || col}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fields.map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm gap-4">
                <span className="text-muted-foreground capitalize shrink-0">
                  {key.replace(/_/g, ' ')}:
                </span>
                <span className="font-medium text-right truncate">{String(val)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status e Notas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={record.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(STATUS_OPTIONS[col] || []).map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione notas sobre este lead..."
                className="min-h-[120px]"
              />
              <Button size="sm" onClick={handleSaveNotes} disabled={saving}>
                <Save className="w-4 h-4 mr-2" /> Salvar Notas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico de Atividades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activities.map((a) => (
              <div key={a.id} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                <p className="font-medium">{a.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.created).toLocaleString('pt-BR')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
