import { useState, useEffect } from 'react'
import {
  getTemplates,
  saveTemplate,
  deleteTemplate,
  type WhatsappTemplate,
} from '@/services/whatsapp_templates'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export function WhatsappTemplatesManager() {
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WhatsappTemplate | null>(null)

  const [formData, setFormData] = useState<Partial<WhatsappTemplate>>({
    name: '',
    trigger_event: 'welcome_message',
    content: '',
    is_active: true,
  })

  const loadData = async () => {
    const userId = pb.authStore.record?.id
    if (!userId) return
    try {
      const data = await getTemplates(userId)
      setTemplates(data)
    } catch (e) {
      toast.error('Erro ao carregar templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    const userId = pb.authStore.record?.id
    if (!userId) return
    if (!formData.name || !formData.content) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    try {
      if (editingTemplate) {
        await saveTemplate({ id: editingTemplate.id, ...formData })
        toast.success('Template atualizado')
      } else {
        await saveTemplate({ ...formData, user: userId })
        toast.success('Template criado')
      }
      setIsOpen(false)
      setEditingTemplate(null)
      setFormData({ name: '', trigger_event: 'welcome_message', content: '', is_active: true })
      loadData()
    } catch (e) {
      toast.error('Erro ao salvar template')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este template?')) return
    try {
      await deleteTemplate(id)
      toast.success('Template excluído')
      loadData()
    } catch (e) {
      toast.error('Erro ao excluir template')
    }
  }

  const openEdit = (t: WhatsappTemplate) => {
    setEditingTemplate(t)
    setFormData({
      name: t.name,
      trigger_event: t.trigger_event,
      content: t.content,
      is_active: t.is_active,
    })
    setIsOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Modelos de Mensagem Automática</h2>
          <p className="text-sm text-muted-foreground">
            Crie templates para eventos e respostas automatizadas.
          </p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsOpen(false)
              setEditingTemplate(null)
              setFormData({
                name: '',
                trigger_event: 'welcome_message',
                content: '',
                is_active: true,
              })
            } else setIsOpen(true)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Modelo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Editar Modelo' : 'Novo Modelo'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Modelo</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Boas-vindas novos leads"
                />
              </div>
              <div className="space-y-2">
                <Label>Gatilho (Evento)</Label>
                <Select
                  value={formData.trigger_event}
                  onValueChange={(v: any) => setFormData({ ...formData, trigger_event: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome_message">Mensagem de Boas-vindas</SelectItem>
                    <SelectItem value="ranking_promotion">Promoção de Ranking</SelectItem>
                    <SelectItem value="benefit_alert">Alerta de Benefício</SelectItem>
                    <SelectItem value="reactivation_campaign">Campanha de Reativação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Conteúdo da Mensagem</Label>
                <Textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Olá, vi que você..."
                  className="h-32"
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Ativar ou desativar o disparo automático
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                />
              </div>
              <Button className="w-full" onClick={handleSave}>
                Salvar Modelo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Gatilho</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Nenhum modelo cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.trigger_event}</TableCell>
                  <TableCell className="text-sm truncate max-w-[200px]" title={t.content}>
                    {t.content}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {t.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
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
