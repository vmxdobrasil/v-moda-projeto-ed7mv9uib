import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import pb from '@/lib/pocketbase/client'
import { getWhatsappConfig, saveWhatsappConfig, type WhatsappConfig } from '@/services/whatsapp'
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
import { Loader2, CheckCircle2, XCircle, Smartphone, ExternalLink } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WhatsappTemplatesManager } from './components/WhatsappTemplatesManager'
import { useRealtime } from '@/hooks/use-realtime'

const schema = z.object({
  api_url: z
    .string()
    .url('A URL deve ser válida (ex: https://evolution-evolution.6xxwvj.easypanel.host)'),
  token: z.string().optional(),
  instance_id: z.string().min(1, 'O ID da Instância é obrigatório'),
})

type FormValues = z.infer<typeof schema>

export default function WhatsappSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [configId, setConfigId] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      api_url: '',
      token: '',
      instance_id: '',
    },
  })

  useEffect(() => {
    const load = async () => {
      try {
        const userId = pb.authStore.record?.id
        if (!userId) return
        const config = await getWhatsappConfig(userId)
        if (config) {
          setConfigId(config.id || null)
          form.reset({
            api_url: config.api_url,
            token: config.token || '',
            instance_id: config.instance_id || '',
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [form])

  useRealtime('whatsapp_configs', (e) => {
    const userId = pb.authStore.record?.id
    if (e.record.user === userId) {
      if (e.action === 'update' || e.action === 'create') {
        setConfigId(e.record.id)
        if (!saving) {
          form.reset({
            api_url: e.record.api_url,
            token: e.record.token || '',
            instance_id: e.record.instance_id || '',
          })
          toast.info('Configurações sincronizadas do servidor.')
        }
      }
    }
  })

  const onSubmit = async (data: FormValues) => {
    const userId = pb.authStore.record?.id
    if (!userId) return

    setSaving(true)
    try {
      const payload: Partial<WhatsappConfig> = {
        id: configId || undefined,
        user: userId,
        api_url: data.api_url,
        instance_id: data.instance_id,
      }
      if (data.token) {
        payload.token = data.token
      }
      const saved = await saveWhatsappConfig(payload)
      setConfigId(saved.id)
      toast.success('Configurações salvas com sucesso!')
    } catch (e) {
      toast.error('Erro ao salvar as configurações.')
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    const values = form.getValues()
    if (!values.api_url) {
      form.trigger('api_url')
      return
    }

    setTesting(true)
    setStatus('idle')
    try {
      // Test via evolution proxy
      const res = await pb.send('/backend/v1/evolution/status', { method: 'GET' })
      if (res?.instance?.state === 'open' || res?.state === 'open') {
        setStatus('success')
        toast.success('Conexão estabelecida com sucesso!')
      } else {
        setStatus('error')
        toast.error(
          `Instância não está conectada. Status: ${res?.instance?.state || res?.state || 'Desconhecido'}`,
        )
      }
    } catch (e) {
      setStatus('error')
      toast.error('Falha ao conectar com a API.')
    } finally {
      setTesting(false)
    }
  }
  const pbUrl = import.meta.env.VITE_POCKETBASE_URL || window.location.origin
  const webhookUrl = `${pbUrl}/backend/v1/n8n-webhook`

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integração WhatsApp & n8n</h1>
        <p className="text-muted-foreground">
          Configure a conexão com sua Evolution API e n8n para gerenciar automações no WhatsApp.
        </p>
      </div>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="api">Configurações de API</TabsTrigger>
          <TabsTrigger value="templates">Modelos de Mensagem (Templates)</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" /> Credenciais da API
                </CardTitle>
                <CardDescription>
                  Insira os dados de conexão do seu servidor para envio de mensagens e sincronização
                  com n8n.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="api_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da Evolution API ou Webhook</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://evolution-evolution.6xxwvj.easypanel.host"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A URL base da sua instância Evolution API ou servidor n8n.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="instance_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Instância</FormLabel>
                            <FormControl>
                              <Input placeholder="ex: vmoda_master" {...field} />
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
                                placeholder={configId ? '••••••••••••••••' : 'Sua Global API Key'}
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Deixe em branco para manter a chave salva atual.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                      <Button type="submit" disabled={saving || testing}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Salvar Configurações
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={testConnection}
                        disabled={testing || saving || !configId}
                      >
                        {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Testar Conexão Salva
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
              {status !== 'idle' && (
                <CardFooter className="bg-muted/50 border-t p-4 flex items-center gap-2">
                  {status === 'success' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-700">
                        Conexão verificada com sucesso! Seu CRM está pronto para enviar mensagens.
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-destructive" />
                      <span className="text-sm font-medium text-destructive">
                        Não foi possível conectar. Verifique seus dados.
                      </span>
                    </>
                  )}
                </CardFooter>
              )}
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
                  <CardTitle>Webhook n8n</CardTitle>
                  <CardDescription>
                    Configure esta URL nos seus nós do n8n para enviar leads recebidos ao CRM.
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
                    Payload esperado (POST json) contendo os campos: <br />
                    <code>name</code>, <code>phone</code> e <code>instance_id</code>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <WhatsappTemplatesManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
