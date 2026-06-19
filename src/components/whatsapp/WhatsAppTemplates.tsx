import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogDescription,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Edit, Save } from 'lucide-react'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/services/whatsapp'

export function WhatsAppTemplates() {
  const [templates, setTemplates] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTpl, setEditingTpl] = useState<any>(null)
  const [form, setForm] = useState({
    name: '',
    trigger_event: 'welcome_message',
    content: '',
    is_active: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      setTemplates(await getTemplates())
    } catch {
      /* intentionally ignored */
    }
  }

  const handleSave = async () => {
    try {
      if (editingTpl) await updateTemplate(editingTpl.id, form)
      else await createTemplate(form)
      toast({ title: 'Sucesso', description: 'Template salvo.' })
      setIsModalOpen(false)
      load()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id)
      toast({ title: 'Sucesso', description: 'Template removido.' })
      load()
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao remover.', variant: 'destructive' })
    }
  }

  const openModal = (tpl?: any) => {
    if (tpl) {
      setEditingTpl(tpl)
      setForm({
        name: tpl.name,
        trigger_event: tpl.trigger_event,
        content: tpl.content,
        is_active: tpl.is_active,
      })
    } else {
      setEditingTpl(null)
      setForm({ name: '', trigger_event: 'welcome_message', content: '', is_active: true })
    }
    setIsModalOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Templates de Mensagem</CardTitle>
          <CardDescription>
            Gerencie os templates usados para mensagens automáticas e envios manuais.
          </CardDescription>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Template
        </Button>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Nenhum template cadastrado.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{tpl.name}</CardTitle>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openModal(tpl)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tpl.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs font-mono">
                    {tpl.trigger_event}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                    {tpl.content}
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-2 w-2 rounded-full ${tpl.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {tpl.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTpl ? 'Editar Template' : 'Novo Template'}</DialogTitle>
            <DialogDescription>
              Use variáveis como {'{{name}}'}, {'{{status}}'} ou {'{{city}}'} no conteúdo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome do Template</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Boas-vindas Lead"
              />
            </div>
            <div className="grid gap-2">
              <Label>Gatilho (Evento)</Label>
              <Select
                value={form.trigger_event}
                onValueChange={(v) => setForm({ ...form, trigger_event: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome_message">Mensagem de Boas-vindas</SelectItem>
                  <SelectItem value="ranking_promotion">Promoção de Ranking</SelectItem>
                  <SelectItem value="benefit_alert">Alerta de Benefício</SelectItem>
                  <SelectItem value="reactivation_campaign">Campanha de Reativação</SelectItem>
                  <SelectItem value="manual_message">Mensagem Manual (CRM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Conteúdo</Label>
              <Textarea
                className="h-32"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Olá {{name}}, seja bem-vindo(a)!"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
