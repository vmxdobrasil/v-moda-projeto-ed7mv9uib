import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Shield, Trash2, Plus, Globe, MessageCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useMagazineStore } from '@/stores/useMagazineStore'
import { useManufacturerStore } from '@/stores/useManufacturerStore'
import { BrandAssetsManager } from '@/components/media/BrandAssetsManager'
import {
  getWhatsappConfig,
  saveWhatsappConfig,
  WhatsappConfig,
  getWhatsappTemplates,
  saveWhatsappTemplate,
  WhatsappTemplate,
} from '@/services/whatsapp'
import pb from '@/lib/pocketbase/client'
import { useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'administrador' | 'gerente'
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin Supremo', email: 'admin@vmoda.com', role: 'administrador' },
  { id: '2', name: 'Maria Gerente', email: 'maria@vmoda.com', role: 'gerente' },
]

export default function Settings() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [newUser, setNewUser] = useState<Partial<User>>({ name: '', email: '', role: 'gerente' })
  const { externalUrl, setExternalUrl } = useMagazineStore()
  const [urlInput, setUrlInput] = useState(externalUrl)
  const { manufacturers, updateVmp } = useManufacturerStore()

  const [waConfig, setWaConfig] = useState<Partial<WhatsappConfig>>({
    api_url: '',
    token: '',
    instance_id: '',
  })

  const [templates, setTemplates] = useState<WhatsappTemplate[]>([])
  const [editingTemplate, setEditingTemplate] = useState<Partial<WhatsappTemplate> | null>(null)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)

  useEffect(() => {
    const userId = pb.authStore.record?.id
    if (userId) {
      getWhatsappConfig(userId).then((conf) => {
        if (conf) setWaConfig(conf)
      })
      getWhatsappTemplates(userId).then((tpls) => {
        setTemplates(tpls)
      })
    }
  }, [])

  const handleSaveTemplate = async () => {
    try {
      const userId = pb.authStore.record?.id
      if (!userId) throw new Error('Não autenticado')
      if (!editingTemplate?.name || !editingTemplate?.trigger_event || !editingTemplate?.content) {
        toast({ description: 'Preencha todos os campos obrigatórios.', variant: 'destructive' })
        return
      }

      const saved = await saveWhatsappTemplate({ ...editingTemplate, user: userId })
      setTemplates((prev) => {
        const idx = prev.findIndex((t) => t.id === saved.id)
        if (idx >= 0) {
          const newTpls = [...prev]
          newTpls[idx] = saved as WhatsappTemplate
          return newTpls
        }
        return [saved as WhatsappTemplate, ...prev]
      })
      setIsTemplateDialogOpen(false)
      toast({ description: 'Modelo salvo com sucesso!' })
    } catch (e) {
      toast({ description: 'Erro ao salvar modelo.', variant: 'destructive' })
    }
  }

  const handleEditTemplate = (tpl: WhatsappTemplate) => {
    setEditingTemplate(tpl)
    setIsTemplateDialogOpen(true)
  }

  const handleCreateTemplate = () => {
    setEditingTemplate({
      name: '',
      trigger_event: 'welcome_message',
      content: '',
      is_active: true,
    })
    setIsTemplateDialogOpen(true)
  }

  const handleSaveWaConfig = async () => {
    try {
      const userId = pb.authStore.record?.id
      if (!userId) throw new Error('Não autenticado')
      await saveWhatsappConfig({ ...waConfig, user: userId })
      toast({ description: 'WhatsApp API configurada com sucesso!' })
    } catch (e) {
      toast({ description: 'Erro ao salvar configurações do WhatsApp.', variant: 'destructive' })
    }
  }

  const handleSaveUrl = () => {
    setExternalUrl(urlInput)
    toast({ description: 'URL da Revista Digital atualizada com sucesso!' })
  }

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast({ description: 'Preencha todos os campos.', variant: 'destructive' })
      return
    }
    const user: User = { ...newUser, id: Math.random().toString() } as User
    setUsers([...users, user])
    setNewUser({ name: '', email: '', role: 'gerente' })
    toast({ description: 'Usuário adicionado com sucesso!' })
  }

  const handleRemoveUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
    toast({ description: 'Usuário removido!' })
  }

  const handleSwitchMyRole = (role: string) => {
    localStorage.setItem('admin_role', role)
    toast({
      description: `Seu papel foi alterado para ${role === 'administrador' ? 'Administrador' : 'Gerente'}. Atualizando painel...`,
    })
    setTimeout(() => window.location.reload(), 1000)
  }

  const currentRole = localStorage.getItem('admin_role') || 'administrador'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações do Sistema</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie acessos e permissões da equipe.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Identidade Visual (Logos)
          </CardTitle>
          <CardDescription>
            Gerencie os logotipos da sua marca para exibição no site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandAssetsManager />
        </CardContent>
      </Card>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Simulador de Acesso (Apenas Demonstração)
          </CardTitle>
          <CardDescription>
            Alterne seu nível de acesso atual para testar as restrições do painel. Gerentes não têm
            acesso a Relatórios nem Configurações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={currentRole === 'administrador' ? 'default' : 'outline'}
              onClick={() => handleSwitchMyRole('administrador')}
            >
              Sou Administrador
            </Button>
            <Button
              variant={currentRole === 'gerente' ? 'default' : 'outline'}
              onClick={() => handleSwitchMyRole('gerente')}
            >
              Sou Gerente
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Integração Externa (Revista Digital)
          </CardTitle>
          <CardDescription>
            Configure a URL do site da revista para direcionamento e SEO da página pública
            (/revista).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
            <div className="flex-1 space-y-2">
              <Label htmlFor="magUrl">URL da Revista Digital</Label>
              <Input
                id="magUrl"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.revistamodaatual.com.br"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSaveUrl}>Salvar URL</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-green-500" />
            Configuração de API do WhatsApp
          </CardTitle>
          <CardDescription>
            Integre seu provedor de WhatsApp para envio de notificações automáticas de ranking e
            benefícios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="waApiUrl">WhatsApp API Endpoint</Label>
            <Input
              id="waApiUrl"
              type="url"
              value={waConfig.api_url}
              onChange={(e) => setWaConfig({ ...waConfig, api_url: e.target.value })}
              placeholder="https://api.whatsapp-provider.com/v1/messages"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="waToken">Access Token</Label>
              <Input
                id="waToken"
                type="password"
                value={waConfig.token}
                onChange={(e) => setWaConfig({ ...waConfig, token: e.target.value })}
                placeholder="Seu token de acesso"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waInstance">Instance ID</Label>
              <Input
                id="waInstance"
                value={waConfig.instance_id}
                onChange={(e) => setWaConfig({ ...waConfig, instance_id: e.target.value })}
                placeholder="ID da instância"
              />
            </div>
          </div>
          <Button onClick={handleSaveWaConfig}>Salvar Credenciais</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              Modelos de Mensagens (WhatsApp)
            </CardTitle>
            <CardDescription>
              Crie e edite templates dinâmicos para envios automáticos e manuais.
            </CardDescription>
          </div>
          <Button onClick={handleCreateTemplate} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Modelo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Gatilho</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum modelo cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((tpl) => (
                    <TableRow key={tpl.id}>
                      <TableCell className="font-medium">{tpl.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {tpl.trigger_event === 'welcome_message'
                            ? 'Boas-Vindas'
                            : tpl.trigger_event === 'ranking_promotion'
                              ? 'Promoção de Ranking'
                              : 'Alerta de Benefício'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tpl.is_active ? 'default' : 'secondary'}>
                          {tpl.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(tpl)}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate?.id ? 'Editar Modelo' : 'Novo Modelo'}</DialogTitle>
            <DialogDescription>Configure o conteúdo da mensagem e seu gatilho.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Modelo</Label>
                <Input
                  value={editingTemplate?.name || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  placeholder="Ex: Boas-vindas Padrão"
                />
              </div>
              <div className="space-y-2">
                <Label>Gatilho (Trigger)</Label>
                <Select
                  value={editingTemplate?.trigger_event || 'welcome_message'}
                  onValueChange={(v: any) =>
                    setEditingTemplate({ ...editingTemplate, trigger_event: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome_message">Boas-Vindas</SelectItem>
                    <SelectItem value="ranking_promotion">Promoção de Ranking</SelectItem>
                    <SelectItem value="benefit_alert">Alerta de Benefício</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Conteúdo da Mensagem</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingTemplate?.is_active ?? true}
                    onCheckedChange={(c) =>
                      setEditingTemplate({ ...editingTemplate, is_active: c })
                    }
                  />
                  <Label>Ativo</Label>
                </div>
              </div>
              <Textarea
                className="min-h-[150px]"
                value={editingTemplate?.content || ''}
                onChange={(e) =>
                  setEditingTemplate({ ...editingTemplate, content: e.target.value })
                }
                placeholder="Escreva sua mensagem aqui..."
              />
              <p className="text-xs text-muted-foreground">
                Variáveis disponíveis:{' '}
                <code className="bg-muted px-1 py-0.5 rounded">{'{{name}}'}</code> (Nome),{' '}
                <code className="bg-muted px-1 py-0.5 rounded">{'{{ranking}}'}</code> (Posição),{' '}
                <code className="bg-muted px-1 py-0.5 rounded">{'{{category}}'}</code> (Categoria),{' '}
                <code className="bg-muted px-1 py-0.5 rounded">{'{{zone}}'}</code> (Zona),{' '}
                <code className="bg-muted px-1 py-0.5 rounded">{'{{benefit_link}}'}</code> (Link).
              </p>
            </div>
            {editingTemplate?.content && (
              <div className="space-y-2 mt-2 p-4 bg-muted/50 rounded-lg border">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  Preview (Exemplo)
                </Label>
                <p className="text-sm whitespace-pre-wrap">
                  {editingTemplate.content
                    .replace(/\{\{name\}\}/g, 'João Silva')
                    .replace(/\{\{ranking\}\}/g, 'TOP 1')
                    .replace(/\{\{category\}\}/g, 'Jeans')
                    .replace(/\{\{zone\}\}/g, 'São Paulo')
                    .replace(/\{\{benefit_link\}\}/g, 'https://vmoda.com/beneficios')}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate}>Salvar Modelo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lojas Fabricantes Parceiras (VMP)</CardTitle>
              <CardDescription>
                Configure o Volume Mínimo de Pedido (em peças) para clientes de atacado (Público 2).
                Clientes de varejo não são afetados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fabricante</TableHead>
                      <TableHead className="w-[150px]">VMP (Peças)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manufacturers.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={m.vmp}
                            onChange={(e) => updateVmp(m.id, parseInt(e.target.value) || 1)}
                            className="w-24"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Novo Membro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nível de Acesso</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(v: any) => setNewUser({ ...newUser, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o acesso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                  </SelectContent>{' '}
                </Select>
              </div>
              <Button onClick={handleAddUser} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipe e Permissões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Acesso</TableHead>
                      <TableHead className="w-[80px] text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'administrador' ? 'default' : 'secondary'}>
                            {user.role === 'administrador' ? 'Administrador' : 'Gerente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleRemoveUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
