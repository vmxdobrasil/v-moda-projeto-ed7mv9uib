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
  DialogDescription,
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
  AlertCircle,
  Loader2,
  Shuffle,
  ShieldCheck,
  QrCode,
  Sliders,
  Send,
  Power,
  PowerOff,
} from 'lucide-react'
import {
  getWhatsappConfigs,
  createWhatsappConfig,
  updateWhatsappConfig,
  deleteWhatsappConfig,
  getEvolutionStatus,
  getEvolutionConnect,
  disconnectEvolutionInstance,
  sendWhatsappMessage,
  type WhatsappConfig,
} from '@/services/whatsapp'
import { WhatsappTools } from './components/WhatsappTools'

export default function WhatsappSettings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('numbers')

  // Lista de instâncias / números em rodízio
  const [configs, setConfigs] = useState<WhatsappConfig[]>([])
  const [loadingConfigs, setLoadingConfigs] = useState(false)
  const [statuses, setStatuses] = useState<Record<string, { state: string; error?: string }>>({})
  const [checkingStatus, setCheckingStatus] = useState(false)

  // Modal de Adicionar/Editar Número
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<WhatsappConfig | null>(null)
  const [configForm, setConfigForm] = useState({
    label: '',
    phone_number: '',
    instance_id: '',
    api_url: 'https://evolution-evolution.6xxwvj.easypanel.host',
    token: '7i5UsFq1MM8pEbt8NqCVDPglfY8v9LTd',
    throttle_interval_sec: 8,
    is_active: true,
  })
  const [isSavingConfig, setIsSavingConfig] = useState(false)

  // Modal de Conexão / Pareamento por QR Code
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [selectedInstanceForQr, setSelectedInstanceForQr] = useState<WhatsappConfig | null>(null)
  const [qrCodeData, setQrCodeData] = useState<string>('')
  const [loadingQr, setLoadingQr] = useState(false)
  const [qrStatusText, setQrStatusText] = useState('')

  // Disparo de teste
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState(
    'Olá! Disparo de teste via rodízio de números V MODA BRASIL.',
  )
  const [testMode, setTestMode] = useState<'round_robin' | string>('round_robin')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

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
    loadConfigs()
    fetchTemplates()
  }, [])

  const loadConfigs = async () => {
    setLoadingConfigs(true)
    try {
      const list = await getWhatsappConfigs(user?.id)
      setConfigs(list)
      checkAllStatuses(list)
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Erro ao carregar números', description: err.message, variant: 'destructive' })
    } finally {
      setLoadingConfigs(false)
    }
  }

  const checkAllStatuses = async (listToTest?: WhatsappConfig[]) => {
    const targetList = listToTest || configs
    if (targetList.length === 0) return
    setCheckingStatus(true)
    const newStatuses: Record<string, any> = {}

    for (const item of targetList) {
      const inst = item.instance_id?.split(',')[0].trim() || 'vmoda'
      try {
        const res = await getEvolutionStatus(inst)
        newStatuses[item.id || inst] = res
      } catch (e: any) {
        newStatuses[item.id || inst] = { state: 'offline', error: e.message }
      }
    }
    setStatuses(newStatuses)
    setCheckingStatus(false)
  }

  const handleOpenConfigModal = (cfg?: WhatsappConfig) => {
    if (cfg) {
      setEditingConfig(cfg)
      setConfigForm({
        label: cfg.label || '',
        phone_number: cfg.phone_number || '',
        instance_id: cfg.instance_id || '',
        api_url: cfg.api_url || 'https://evolution-evolution.6xxwvj.easypanel.host',
        token: cfg.token || '7i5UsFq1MM8pEbt8NqCVDPglfY8v9LTd',
        throttle_interval_sec: cfg.throttle_interval_sec || 8,
        is_active: cfg.is_active !== false,
      })
    } else {
      setEditingConfig(null)
      const nextNumber = configs.length + 1
      setConfigForm({
        label: `Número ${nextNumber} - Operação`,
        phone_number: '',
        instance_id: `vmoda_num_${nextNumber}_${Date.now().toString(36).slice(-4)}`,
        api_url: 'https://evolution-evolution.6xxwvj.easypanel.host',
        token: '7i5UsFq1MM8pEbt8NqCVDPglfY8v9LTd',
        throttle_interval_sec: 8,
        is_active: true,
      })
    }
    setIsConfigModalOpen(true)
  }

  const handleSaveConfig = async () => {
    if (!configForm.instance_id.trim()) {
      toast({
        title: 'Aviso',
        description: 'O ID da Instância é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    setIsSavingConfig(true)
    try {
      const payload: Partial<WhatsappConfig> = {
        label: configForm.label.trim() || configForm.instance_id.trim(),
        phone_number: configForm.phone_number.trim(),
        instance_id: configForm.instance_id.trim(),
        api_url: configForm.api_url.trim(),
        token: configForm.token.trim(),
        throttle_interval_sec: Number(configForm.throttle_interval_sec) || 8,
        is_active: configForm.is_active,
        user: user?.id,
      }

      if (editingConfig && editingConfig.id) {
        await updateWhatsappConfig(editingConfig.id, payload)
        toast({ title: 'Sucesso', description: 'Número atualizado com sucesso.' })
      } else {
        await createWhatsappConfig(payload)
        toast({ title: 'Sucesso', description: 'Novo número adicionado ao rodízio.' })
      }
      setIsConfigModalOpen(false)
      loadConfigs()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleToggleActive = async (cfg: WhatsappConfig) => {
    if (!cfg.id) return
    const newStatus = !cfg.is_active
    try {
      await updateWhatsappConfig(cfg.id, { is_active: newStatus })
      setConfigs((prev) => prev.map((c) => (c.id === cfg.id ? { ...c, is_active: newStatus } : c)))
      toast({
        title: newStatus ? 'Número Ativado' : 'Número Pausado',
        description: newStatus
          ? `O número ${cfg.label || cfg.instance_id} agora participa do rodízio.`
          : `O número ${cfg.label || cfg.instance_id} foi pausado e não receberá disparos.`,
      })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDeleteConfig = async (id: string, label?: string) => {
    if (!confirm(`Deseja realmente remover o número "${label || id}" do rodízio?`)) return
    try {
      await deleteWhatsappConfig(id)
      toast({ title: 'Sucesso', description: 'Número removido do rodízio.' })
      loadConfigs()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  // Abre modal de pareamento por QR Code
  const handleOpenQrModal = async (cfg: WhatsappConfig) => {
    setSelectedInstanceForQr(cfg)
    setIsQrModalOpen(true)
    setQrCodeData('')
    setQrStatusText('Verificando status da instância...')
    setLoadingQr(true)

    const inst = cfg.instance_id?.split(',')[0].trim() || 'vmoda'
    try {
      const statusRes = await getEvolutionStatus(inst)
      if (statusRes.state === 'open' || statusRes.state === 'connected') {
        setQrStatusText('Esta instância já está conectada e operacional!')
        setLoadingQr(false)
        return
      }

      setQrStatusText('Gerando QR Code para pareamento...')
      const connRes = await getEvolutionConnect(inst)
      if (connRes.base64) {
        setQrCodeData(connRes.base64)
        setQrStatusText('Escaneie com seu WhatsApp para conectar:')
      } else if (connRes.qrcode) {
        setQrCodeData(connRes.qrcode)
        setQrStatusText('Escaneie com seu WhatsApp para conectar:')
      } else {
        setQrStatusText('Não foi possível obter o QR Code. Tente reiniciar a conexão.')
      }
    } catch (err: any) {
      setQrStatusText('Falha ao conectar à Evolution API: ' + err.message)
    } finally {
      setLoadingQr(false)
    }
  }

  const handleDisconnectInstance = async () => {
    if (!selectedInstanceForQr) return
    const inst = selectedInstanceForQr.instance_id?.split(',')[0].trim() || 'vmoda'
    if (!confirm(`Deseja desconectar o WhatsApp da instância "${inst}"?`)) return

    setLoadingQr(true)
    try {
      await disconnectEvolutionInstance(inst)
      toast({ title: 'Desconectado', description: 'Sessão encerrada com sucesso.' })
      handleOpenQrModal(selectedInstanceForQr)
      checkAllStatuses()
    } catch (err: any) {
      toast({ title: 'Erro ao desconectar', description: err.message, variant: 'destructive' })
    } finally {
      setLoadingQr(false)
    }
  }

  // Disparo de teste com rodízio
  const handleSendTest = async () => {
    if (!testPhone.trim() || !testMessage.trim()) {
      toast({
        title: 'Aviso',
        description: 'Informe o telefone e a mensagem de teste.',
        variant: 'destructive',
      })
      return
    }

    setIsSendingTest(true)
    setTestResult(null)
    try {
      const payload: any = {
        phone: testPhone.trim(),
        message: testMessage.trim(),
      }
      if (testMode !== 'round_robin') {
        payload.config_id = testMode
      }

      const res = await sendWhatsappMessage(payload)
      setTestResult(res)
      toast({
        title: 'Mensagem Enviada!',
        description: `Disparado com sucesso via: ${res.sent_via_label || res.sent_via_instance || 'Rodízio'}`,
      })
      loadConfigs() // Atualiza last_used_at
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Falha no disparo de teste',
        description: err.message || 'Erro ao enviar mensagem.',
        variant: 'destructive',
      })
    } finally {
      setIsSendingTest(false)
    }
  }

  // Templates
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

  const activeConfigsCount = configs.filter((c) => c.is_active !== false).length
  const instanceNames = configs
    .map((c) => c.instance_id?.split(',')[0].trim())
    .filter(Boolean) as string[]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Smartphone className="w-8 h-8 text-primary" /> WhatsApp Multi-Número (Rodízio)
          </h1>
          <p className="text-muted-foreground mt-1">
            Distribua seus disparos automaticamente entre vários números de WhatsApp para evitar
            bloqueios da Meta.
          </p>
        </div>
        <Button onClick={() => handleOpenConfigModal()} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Adicionar Novo Número
        </Button>
      </div>

      {/* Banner Explicativo do Rodízio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-6 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-950">Rodízio Circular Ativo</p>
              <p className="text-xs text-emerald-800 mt-1">
                {activeConfigsCount > 1
                  ? `${activeConfigsCount} números ativos alternando envios em round-robin justo.`
                  : activeConfigsCount === 1
                    ? '1 número ativo. Adicione mais números para ativar o rodízio.'
                    : 'Nenhum número ativo. Ative ou cadastre um número.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-950">Proteção Anti-Banimento</p>
              <p className="text-xs text-blue-800 mt-1">
                Throttle configurável por número (padrão 8s) + digitação humana (1 a 3s) para
                simular comportamento real.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-950">Failover Automático</p>
              <p className="text-xs text-amber-800 mt-1">
                Se um número estiver offline ou desconectado, o sistema tenta automaticamente o
                próximo do rodízio.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="numbers">Números do Rodízio ({configs.length})</TabsTrigger>
          <TabsTrigger value="test">Testar Disparo</TabsTrigger>
          <TabsTrigger value="tools">Extrator de Grupos</TabsTrigger>
          <TabsTrigger value="templates">Templates de Mensagem</TabsTrigger>
        </TabsList>

        {/* ABA: NÚMEROS DO RODÍZIO */}
        <TabsContent value="numbers" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Instâncias e Números Cadastrados</CardTitle>
                <CardDescription>
                  Cada número pareado via QR Code na Evolution API atua como um remetente alternado
                  nas mensagens do sistema.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => checkAllStatuses()}
                disabled={checkingStatus || configs.length === 0}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
                Atualizar Status
              </Button>
            </CardHeader>
            <CardContent>
              {loadingConfigs ? (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p>Carregando números...</p>
                </div>
              ) : configs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                  <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-25" />
                  <p className="font-medium text-base">Nenhum número cadastrado no rodízio</p>
                  <p className="text-sm mt-1 max-w-md mx-auto">
                    Clique em "Adicionar Novo Número" para cadastrar sua primeira instância e
                    escanear o QR Code.
                  </p>
                  <Button onClick={() => handleOpenConfigModal()} className="mt-4 gap-2">
                    <Plus className="w-4 h-4" /> Adicionar Primeiro Número
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número / Etiqueta</TableHead>
                        <TableHead>ID da Instância</TableHead>
                        <TableHead>Status Conexão</TableHead>
                        <TableHead>Intervalo (Anti-Ban)</TableHead>
                        <TableHead>Último Envio</TableHead>
                        <TableHead>Rodízio</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {configs.map((cfg) => {
                        const inst = cfg.instance_id?.split(',')[0].trim() || 'vmoda'
                        const st = statuses[cfg.id || inst]
                        const isConnected = st?.state === 'open' || st?.state === 'connected'
                        const isConnecting = st?.state === 'connecting'
                        const isActive = cfg.is_active !== false

                        return (
                          <TableRow
                            key={cfg.id}
                            className={!isActive ? 'opacity-60 bg-muted/20' : ''}
                          >
                            <TableCell>
                              <div className="font-semibold flex items-center gap-2">
                                <span>{cfg.label || 'Número sem etiqueta'}</span>
                              </div>
                              {cfg.phone_number && (
                                <p className="text-xs text-muted-foreground">{cfg.phone_number}</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                {cfg.instance_id}
                              </code>
                            </TableCell>
                            <TableCell>
                              {checkingStatus ? (
                                <Badge variant="outline" className="gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" /> Verificando
                                </Badge>
                              ) : isConnected ? (
                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 gap-1 border-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Conectado
                                </Badge>
                              ) : isConnecting ? (
                                <Badge
                                  variant="outline"
                                  className="text-blue-700 bg-blue-50 border-blue-200 gap-1"
                                >
                                  <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />{' '}
                                  Conectando
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-rose-700 bg-rose-50 border-rose-200 gap-1"
                                >
                                  <AlertCircle className="w-3 h-3 text-rose-600" /> Desconectado
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium">
                                {cfg.throttle_interval_sec || 8}s entre disparos
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {cfg.last_used_at
                                ? new Date(cfg.last_used_at).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                  })
                                : 'Nunca utilizado'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={isActive}
                                  onCheckedChange={() => handleToggleActive(cfg)}
                                  title={
                                    isActive
                                      ? 'Clique para pausar este número'
                                      : 'Clique para ativar'
                                  }
                                />
                                <span className="text-xs font-medium">
                                  {isActive ? 'Ativo' : 'Pausado'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenQrModal(cfg)}
                                  className="h-8 gap-1 text-xs"
                                  title="Conectar ou Parear WhatsApp via QR Code"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  Parear
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleOpenConfigModal(cfg)}
                                  title="Editar Parâmetros"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteConfig(cfg.id!, cfg.label)}
                                  title="Remover Número"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: TESTAR DISPARO */}
        <TabsContent value="test" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" /> Teste de Envio com Rodízio
                </CardTitle>
                <CardDescription>
                  Valide o envio e observe qual número foi selecionado pelo algoritmo de rodízio
                  circular.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Modo de Roteamento</Label>
                  <Select value={testMode} onValueChange={setTestMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round_robin">
                        🔄 Rodízio Automático (Round-Robin entre os ativos)
                      </SelectItem>
                      {configs.map((c) => (
                        <SelectItem key={c.id} value={c.id!}>
                          🎯 Forçar: {c.label || c.instance_id} {!c.is_active ? '(Pausado)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Telefone de Teste</Label>
                  <Input
                    placeholder="Ex: 5511999999999 (ou 11999999999)"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    O formato internacional 55 será garantido automaticamente.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Mensagem</Label>
                  <Textarea
                    rows={4}
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Digite a mensagem de teste..."
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSendTest}
                  disabled={isSendingTest || configs.length === 0}
                  className="w-full gap-2"
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Enviando com Throttle...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Disparar Mensagem de Teste
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resultado do Disparo</CardTitle>
                <CardDescription>Auditoria do último disparo realizado.</CardDescription>
              </CardHeader>
              <CardContent>
                {testResult ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2 text-emerald-800 font-semibold mb-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Mensagem Entregue
                      </div>
                      <div className="text-xs space-y-1 text-emerald-950">
                        <p>
                          <strong>Número/Instância Escolhida:</strong>{' '}
                          {testResult.sent_via_instance}
                        </p>
                        <p>
                          <strong>Etiqueta:</strong> {testResult.sent_via_label}
                        </p>
                        <p>
                          <strong>Destinatário:</strong> {testResult.phone}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded text-xs font-mono overflow-auto max-h-48">
                      {JSON.stringify(testResult, null, 2)}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Nenhum teste disparado nesta sessão.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA: EXTRATOR DE GRUPOS */}
        <TabsContent value="tools" className="space-y-6">
          <WhatsappTools instances={instanceNames} />
        </TabsContent>

        {/* ABA: TEMPLATES */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Templates de Mensagem</CardTitle>
                <CardDescription>
                  Crie mensagens padronizadas para boas-vindas, promoções de ranking e campanhas.
                </CardDescription>
              </div>
              <Button onClick={() => openTemplateModal()} className="gap-2">
                <Plus className="w-4 h-4" /> Novo Template
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
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
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

      {/* DIALOG: ADICIONAR / EDITAR NÚMERO */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Editar Número do Rodízio' : 'Adicionar Novo Número ao Rodízio'}
            </DialogTitle>
            <DialogDescription>
              Cadastre a instância da Evolution API correspondente ao chip/número que fará parte do
              rodízio.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cfg-label">Nome / Etiqueta do Número</Label>
              <Input
                id="cfg-label"
                value={configForm.label}
                onChange={(e) => setConfigForm({ ...configForm, label: e.target.value })}
                placeholder="Ex: Número 1 — Fabiana (Vendas)"
              />
              <p className="text-xs text-muted-foreground">
                Um nome amigável para identificar facilmente este número no painel.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cfg-instance">ID da Instância (Evolution)</Label>
                <Input
                  id="cfg-instance"
                  value={configForm.instance_id}
                  onChange={(e) => setConfigForm({ ...configForm, instance_id: e.target.value })}
                  placeholder="ex: vmoda_numero_1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cfg-phone">Telefone (Opcional)</Label>
                <Input
                  id="cfg-phone"
                  value={configForm.phone_number}
                  onChange={(e) => setConfigForm({ ...configForm, phone_number: e.target.value })}
                  placeholder="5511999999999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cfg-throttle">Intervalo Mínimo Anti-Banimento (Segundos)</Label>
              <Input
                id="cfg-throttle"
                type="number"
                min={1}
                max={300}
                value={configForm.throttle_interval_sec}
                onChange={(e) =>
                  setConfigForm({ ...configForm, throttle_interval_sec: Number(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                Tempo mínimo de espera entre dois disparos consecutivos usando{' '}
                <strong>este mesmo número</strong>. Padrão recomendado: 8 a 15 segundos.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cfg-url">URL da Evolution API</Label>
              <Input
                id="cfg-url"
                value={configForm.api_url}
                onChange={(e) => setConfigForm({ ...configForm, api_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cfg-token">Chave da API (Token)</Label>
              <Input
                id="cfg-token"
                type="password"
                value={configForm.token}
                onChange={(e) => setConfigForm({ ...configForm, token: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
              <div className="space-y-0.5">
                <Label>Número Ativo no Rodízio</Label>
                <p className="text-xs text-muted-foreground">
                  Se desativado, o motor de envio pulará este número.
                </p>
              </div>
              <Switch
                checked={configForm.is_active}
                onCheckedChange={(v) => setConfigForm({ ...configForm, is_active: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveConfig} disabled={isSavingConfig}>
              {isSavingConfig && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Número
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: PAREAR / QR CODE */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" /> Pareamento WhatsApp
            </DialogTitle>
            <DialogDescription>
              Instância:{' '}
              <strong>{selectedInstanceForQr?.label || selectedInstanceForQr?.instance_id}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-4 space-y-4 min-h-[260px]">
            {loadingQr ? (
              <div className="flex flex-col items-center text-muted-foreground py-8">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
                <p className="text-sm">{qrStatusText}</p>
              </div>
            ) : qrCodeData ? (
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-border">
                  {qrCodeData.startsWith('data:image') ? (
                    <img src={qrCodeData} alt="QR Code" className="w-56 h-56 object-contain" />
                  ) : (
                    <QRCodeDisplay data={qrCodeData} size={224} />
                  )}
                </div>
                <p className="text-sm font-medium mt-3 text-emerald-700">QR Code pronto!</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Abra o WhatsApp no celular deste número &gt; Aparelhos Conectados &gt; Conectar
                  aparelho.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-6 px-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-2" />
                <p className="text-base font-semibold text-emerald-950">WhatsApp Conectado</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">{qrStatusText}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnectInstance}
                  className="mt-4 text-destructive hover:text-destructive gap-1"
                >
                  <PowerOff className="w-3.5 h-3.5" /> Desconectar Sessão
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between sm:justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedInstanceForQr && handleOpenQrModal(selectedInstanceForQr)}
              disabled={loadingQr}
              className="gap-1 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingQr ? 'animate-spin' : ''}`} /> Atualizar
              QR Code
            </Button>
            <Button onClick={() => setIsQrModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: NOVO / EDITAR TEMPLATE */}
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
