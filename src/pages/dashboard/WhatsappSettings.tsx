import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'

export default function WhatsappSettings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('connection')
  const [config, setConfig] = useState<any>(null)

  // Connection State
  const [status, setStatus] = useState<any>(null)
  const [qrCode, setQrCode] = useState<string>('')
  const [loadingStatus, setLoadingStatus] = useState(false)

  // Config Form State
  const [apiUrl, setApiUrl] = useState('https://evolution-evolution.6xxwvj.easypanel.host')
  const [instanceId, setInstanceId] = useState('')
  const [isSavingConfig, setIsSavingConfig] = useState(false)

  // Templates State
  const [templates, setTemplates] = useState<any[]>([])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    trigger_event: 'welcome_message',
    content: '',
    is_active: true,
  })
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)

  useEffect(() => {
    fetchConfig()
    fetchTemplates()
  }, [])

  const fetchConfig = async () => {
    try {
      const records = await pb
        .collection('whatsapp_configs')
        .getFullList({ filter: `user = '${user?.id}'` })
      if (records.length > 0) {
        setConfig(records[0])
        setApiUrl(records[0].api_url)
        setInstanceId(records[0].instance_id || '')
      }
      fetchStatus()
    } catch (error) {
      console.error(error)
    }
  }

  const saveConfig = async () => {
    setIsSavingConfig(true)
    try {
      const data = {
        user: user?.id,
        api_url: apiUrl,
        instance_id: instanceId,
      }
      if (config) {
        await pb.collection('whatsapp_configs').update(config.id, data)
      } else {
        const newConfig = await pb.collection('whatsapp_configs').create(data)
        setConfig(newConfig)
      }
      toast({ title: 'Sucesso', description: 'Configurações salvas.' })
      fetchStatus()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setIsSavingConfig(false)
    }
  }

  const fetchStatus = async () => {
    setLoadingStatus(true)
    setQrCode('')
    try {
      const res = await pb.send('/backend/v1/evolution_api/status', { method: 'GET' })
      setStatus(res)
      if (res.state !== 'open' && res.state !== 'connected') {
        fetchQrCode()
      }
    } catch (err) {
      console.error(err)
      setStatus({ state: 'error', error: 'Falha ao verificar status' })
    } finally {
      setLoadingStatus(false)
    }
  }

  const fetchQrCode = async () => {
    try {
      const res = await pb.send('/backend/v1/evolution_api/connect', { method: 'GET' })
      if (res.base64) {
        setQrCode(res.base64)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchTemplates = async () => {
    try {
      const records = await pb.collection('whatsapp_templates').getFullList({
        filter: `user = '${user?.id}'`,
        sort: '-created',
      })
      setTemplates(records)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.content) {
      toast({
        title: 'Aviso',
        description: 'Nome e conteúdo são obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    setIsSavingTemplate(true)
    try {
      const data = { ...templateForm, user: user?.id }
      if (editingTemplate) {
        await pb.collection('whatsapp_templates').update(editingTemplate.id, data)
        toast({ title: 'Sucesso', description: 'Template atualizado.' })
      } else {
        await pb.collection('whatsapp_templates').create(data)
        toast({ title: 'Sucesso', description: 'Template criado.' })
      }
      setIsTemplateModalOpen(false)
      fetchTemplates()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Deseja realmente excluir este template?')) return
    try {
      await pb.collection('whatsapp_templates').delete(id)
      toast({ title: 'Sucesso', description: 'Template excluído.' })
      fetchTemplates()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const openTemplateModal = (template?: any) => {
    if (template) {
      setEditingTemplate(template)
      setTemplateForm({
        name: template.name,
        trigger_event: template.trigger_event,
        content: template.content,
        is_active: template.is_active,
      })
    } else {
      setEditingTemplate(null)
      setTemplateForm({ name: '', trigger_event: 'welcome_message', content: '', is_active: true })
    }
    setIsTemplateModalOpen(true)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Settings</h1>
        <p className="text-muted-foreground">
          Gerencie sua conexão e templates de mensagens automatizadas.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="connection">Conexão do Dispositivo</TabsTrigger>
          <TabsTrigger value="templates">Templates de Mensagem</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuração da API</CardTitle>
                <CardDescription>Defina os parâmetros para a Evolution API.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>URL da API</Label>
                  <Input
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>ID da Instância</Label>
                  <Input
                    value={instanceId}
                    onChange={(e) => setInstanceId(e.target.value)}
                    placeholder="ex: vmoda_minha_marca"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveConfig} disabled={isSavingConfig}>
                  {isSavingConfig && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Configuração
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status da Conexão</CardTitle>
                <CardDescription>Status atual da instância configurada.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-4 min-h-[200px]">
                {loadingStatus ? (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>Verificando status...</p>
                  </div>
                ) : status?.state === 'open' || status?.state === 'connected' ? (
                  <div className="flex flex-col items-center text-green-600">
                    <CheckCircle2 className="h-16 w-16 mb-4" />
                    <h3 className="text-xl font-semibold">WhatsApp Conectado</h3>
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      Sua instância está pronta para enviar e receber mensagens.
                    </p>
                  </div>
                ) : qrCode ? (
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-medium mb-4">Escaneie o QR Code</h3>
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-border">
                      <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e escaneie este
                      código.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-amber-600">
                    <AlertCircle className="h-16 w-16 mb-4" />
                    <h3 className="text-xl font-semibold">Desconectado</h3>
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      {status?.error ||
                        'A instância não está conectada ou configurada corretamente.'}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-center border-t p-4 bg-muted/20">
                <Button variant="outline" onClick={fetchStatus} disabled={loadingStatus}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Atualizar Status
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Templates de Mensagem</CardTitle>
                <CardDescription>
                  Crie mensagens padronizadas para acionamentos manuais e automáticos.
                </CardDescription>
              </div>
              <Button onClick={() => openTemplateModal()}>
                <Plus className="mr-2 h-4 w-4" /> Novo Template
              </Button>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhum template configurado ainda.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Gatilho / Evento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {t.trigger_event.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {t.is_active ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openTemplateModal(t)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteTemplate(t.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Editar Template' : 'Novo Template'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Interno</Label>
                <Input
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="Ex: Boas Vindas Novo Lead"
                />
              </div>
              <div className="space-y-2">
                <Label>Gatilho / Categoria</Label>
                <Select
                  value={templateForm.trigger_event}
                  onValueChange={(v) => setTemplateForm({ ...templateForm, trigger_event: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome_message">Mensagem de Boas Vindas</SelectItem>
                    <SelectItem value="ranking_promotion">Promoção de Ranking</SelectItem>
                    <SelectItem value="benefit_alert">Alerta de Benefício</SelectItem>
                    <SelectItem value="reactivation_campaign">Campanha de Reativação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Conteúdo da Mensagem</Label>
              <Textarea
                value={templateForm.content}
                onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                placeholder="Olá {{name}}, vimos que você tem interesse na nossa coleção..."
                className="min-h-[150px]"
              />
              <p className="text-xs text-muted-foreground">
                Variáveis disponíveis: {'{{name}}'}, {'{{status}}'}, {'{{city}}'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={templateForm.is_active}
                onCheckedChange={(v) => setTemplateForm({ ...templateForm, is_active: v })}
              />
              <Label>Template Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate} disabled={isSavingTemplate}>
              {isSavingTemplate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
