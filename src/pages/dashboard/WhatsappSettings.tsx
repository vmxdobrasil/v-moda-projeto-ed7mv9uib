import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import pb from '@/lib/pocketbase/client'
import {
  getWhatsappConfigs,
  saveWhatsappConfig,
  deleteWhatsappConfig,
  type WhatsappConfig,
} from '@/services/whatsapp'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Smartphone,
  ExternalLink,
  Plus,
  Trash2,
  Server,
  Activity,
  MessageSquare,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WhatsappTemplatesManager } from './components/WhatsappTemplatesManager'
import { WhatsappTools } from './components/WhatsappTools'
import { useRealtime } from '@/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'

const schema = z.object({
  api_url: z
    .string()
    .url('A URL deve ser válida (ex: https://evolution-evolution.6xxwvj.easypanel.host)')
    .refine((val) => !val.endsWith('/'), {
      message: "A URL da API não deve terminar com '/'.",
    }),
  token: z.string().optional(),
  instance_id: z.string().min(1, 'O ID da Instância é obrigatório'),
})

type FormValues = z.infer<typeof schema>

export default function WhatsappSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [statuses, setStatuses] = useState<Record<string, 'success' | 'error'>>({})
  const [msgCounts, setMsgCounts] = useState<Record<string, number>>({})
  const [configs, setConfigs] = useState<WhatsappConfig[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      api_url: '',
      token: '',
      instance_id: '',
    },
  })

  const loadData = async () => {
    try {
      const userId = pb.authStore.record?.id
      if (!userId) return
      const data = await getWhatsappConfigs(userId)
      setConfigs(data)
      if (data.length === 0) setIsAdding(true)

      data.forEach(async (cfg) => {
        if (!cfg.instance_id) return
        const instNames = cfg.instance_id.split(',').map((s) => s.trim())
        for (const name of instNames) {
          if (!name) continue
          try {
            const channels = await pb
              .collection('channels')
              .getFullList({ filter: `name = "${name}"` })
            if (channels.length > 0) {
              const msgs = await pb
                .collection('messages')
                .getList(1, 1, { filter: `channel = "${channels[0].id}"` })
              setMsgCounts((prev) => ({ ...prev, [name]: msgs.totalItems }))
            }
          } catch {
            /* intentionally ignored */
          }
        }
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('whatsapp_configs', (e) => {
    const userId = pb.authStore.record?.id
    if (e.record.user === userId) {
      loadData()
    }
  })

  const onSubmit = async (data: FormValues) => {
    const userId = pb.authStore.record?.id
    if (!userId) return

    setSaving(true)
    try {
      const payload: Partial<WhatsappConfig> = {
        user: userId,
        api_url: data.api_url,
        instance_id: data.instance_id,
      }
      if (data.token) {
        payload.token = data.token
      }
      if (editingId) {
        payload.id = editingId
      }
      await saveWhatsappConfig(payload)
      toast.success(
        editingId ? 'Instância atualizada com sucesso!' : 'Instância adicionada com sucesso!',
      )
      setIsAdding(false)
      setEditingId(null)
      form.reset()
      loadData()
    } catch (e) {
      toast.error('Erro ao salvar a instância.')
    } finally {
      setSaving(false)
    }
  }

  const removeConfig = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta instância?')) return
    try {
      await deleteWhatsappConfig(id)
      toast.success('Instância removida')
      loadData()
    } catch (e) {
      toast.error('Erro ao remover a instância')
    }
  }

  const testConnection = async (config: WhatsappConfig) => {
    setTestingId(config.id!)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      const url = `/backend/v1/evolution_api/status${config.instance_id ? `?instance=${config.instance_id}` : ''}`

      const res = await pb.send(url, { method: 'GET', signal: controller.signal }).catch((err) => {
        clearTimeout(timeoutId)
        if (err.name === 'AbortError' || err.isAbort) throw new Error('Timeout')
        throw err
      })
      clearTimeout(timeoutId)

      if (res?.instance?.state === 'open' || res?.state === 'open') {
        setStatuses((prev) => ({ ...prev, [config.id!]: 'success' }))
        toast.success(`Conexão estabelecida com a instância ${config.instance_id}!`)
      } else {
        setStatuses((prev) => ({ ...prev, [config.id!]: 'error' }))
        toast.error(
          `A instância ${config.instance_id} não está conectada. Status: ${res?.instance?.state || res?.state || 'Desconhecido'}`,
        )
      }
    } catch (e: any) {
      setStatuses((prev) => ({ ...prev, [config.id!]: 'error' }))
      if (e.message === 'Timeout') {
        toast.error(
          "Erro de Conexão: O servidor demorou muito para responder. Verifique se o serviço 'evolution' está rodando no seu Easypanel.",
        )
      } else {
        toast.error(`Falha ao conectar com a instância ${config.instance_id}.`)
      }
    } finally {
      setTestingId(null)
    }
  }

  const pbUrl = import.meta.env.VITE_POCKETBASE_URL || window.location.origin
  const webhookUrl = `${pbUrl}/backend/v1/evolution_api/webhook`

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    )
  }

  const allInstances = configs.flatMap((c) =>
    c.instance_id ? c.instance_id.split(',').map((i) => i.trim()) : [],
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integração WhatsApp Native Engine</h1>
        <p className="text-muted-foreground">
          Gerencie múltiplas instâncias da Evolution API (até 7+ números). Nosso motor de IA nativo
          processa as mensagens, substituindo a necessidade de workflows externos como o n8n.
        </p>
      </div>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="api">Gerenciamento de Instâncias</TabsTrigger>
          <TabsTrigger value="templates">Modelos de Mensagem</TabsTrigger>
          <TabsTrigger value="tools">Ferramentas & Extrator</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" /> Instâncias Registradas
                  </CardTitle>
                  <CardDescription>
                    Gerencie suas conexões do WhatsApp. Múltiplas instâncias permitem rotação de
                    mensagens.
                  </CardDescription>
                </div>
                {!isAdding && !editingId && (
                  <Button
                    onClick={() => {
                      setIsAdding(true)
                      setEditingId(null)
                      form.reset({ api_url: '', token: '', instance_id: '' })
                    }}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Nova Instância
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {configs.length === 0 && !isAdding && (
                  <div className="text-center py-8 text-muted-foreground border rounded-md border-dashed">
                    Nenhuma instância cadastrada. Clique em "Nova Instância" para começar.
                  </div>
                )}

                {configs.map((config) => (
                  <div
                    key={config.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md bg-card shadow-sm gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Server className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-base">
                          {config.instance_id || 'Instância sem nome'}
                        </span>
                        {statuses[config.id!] === 'success' && (
                          <Badge className="bg-green-500 hover:bg-green-600">Conectada</Badge>
                        )}
                        {statuses[config.id!] === 'error' && (
                          <Badge variant="destructive">Desconectada</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground break-all mb-2">
                        {config.api_url}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {config.instance_id?.split(',').map((name) => {
                          const n = name.trim()
                          if (!n) return null
                          return (
                            <Badge
                              key={n}
                              variant="outline"
                              className="text-xs flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              {n}: {msgCounts[n] || 0} msgs
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(config.id!)
                          form.reset({
                            api_url: config.api_url,
                            instance_id: config.instance_id || '',
                            token: config.token || '',
                          })
                          setIsAdding(true)
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => testConnection(config)}
                        disabled={testingId === config.id}
                      >
                        {testingId === config.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Activity className="w-4 h-4 mr-2" />
                        )}
                        Testar Conexão
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeConfig(config.id!)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {isAdding && (
                  <div className="mt-6 p-4 border rounded-md bg-muted/30">
                    <h3 className="font-semibold mb-4 text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4" />{' '}
                      {editingId ? 'Editar Instância' : 'Adicionar Nova Instância'}
                    </h3>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="api_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL da Evolution API</FormLabel>
                              <FormControl>
                                <Input placeholder="https://evolution.seuservidor.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="instance_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome/ID da Instância</FormLabel>
                              <FormControl>
                                <Input placeholder="ex: vmodabrasil_vendas_1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="token"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Global API Key (Token)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Sua Global API Key"
                                  type="password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-center gap-2 pt-2">
                          <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Salvar Instância
                          </Button>
                          {configs.length > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsAdding(false)
                                setEditingId(null)
                              }}
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Links de Infraestrutura</CardTitle>
                  <CardDescription>Acesse rapidamente seus painéis de controle.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <a
                    href="https://evolution-evolution.6xxwvj.easypanel.host"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors group"
                  >
                    <div>
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                        Painel Evolution API
                      </h4>
                      <p className="text-xs text-muted-foreground">Gerenciar instâncias WhatsApp</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>

                  <a
                    href="https://n8n-n8n.6xxwvj.easypanel.host"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors group"
                  >
                    <div>
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                        Painel n8n
                      </h4>
                      <p className="text-xs text-muted-foreground">Workflows de automação</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Webhook Global Evolution</CardTitle>
                  <CardDescription>
                    Configure esta URL como o Webhook global na Evolution API para as suas
                    instâncias. (Eventos: messages.upsert)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-muted rounded-md flex items-center justify-between gap-4 overflow-hidden">
                    <code className="text-xs truncate text-muted-foreground" title={webhookUrl}>
                      {webhookUrl}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 h-8"
                      onClick={() => {
                        navigator.clipboard.writeText(webhookUrl)
                        toast.success('URL copiada!')
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                    Este endpoint recebe as mensagens recebidas, vincula ao cliente existente (ou
                    cria um novo Lead) e aciona o motor de Inteligência Artificial nativo do V Moda.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Webhook Social Leads (FB/IG)</CardTitle>
                  <CardDescription>
                    Configure esta URL nas suas automações (Meta Business, Zapier) para captação
                    nativa de leads sociais.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-muted rounded-md flex items-center justify-between gap-4 overflow-hidden">
                    <code
                      className="text-xs truncate text-muted-foreground"
                      title={`${pbUrl}/backend/v1/social-leads/webhook`}
                    >
                      {`${pbUrl}/backend/v1/social-leads/webhook`}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 h-8"
                      onClick={() => {
                        navigator.clipboard.writeText(`${pbUrl}/backend/v1/social-leads/webhook`)
                        toast.success('URL copiada!')
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                    Faça uma requisição POST contendo{' '}
                    <code className="bg-background px-1 py-0.5 rounded border">name</code>,{' '}
                    <code className="bg-background px-1 py-0.5 rounded border">phone</code>,{' '}
                    <code className="bg-background px-1 py-0.5 rounded border">
                      instagram_handle
                    </code>{' '}
                    e{' '}
                    <code className="bg-background px-1 py-0.5 rounded border">
                      manufacturer_id
                    </code>
                    . O sistema realiza deduplicação e cria logs de importação.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <WhatsappTemplatesManager />
        </TabsContent>

        <TabsContent value="tools">
          <WhatsappTools instances={allInstances} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
