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
import { Loader2, CheckCircle2, XCircle, Smartphone } from 'lucide-react'

const schema = z.object({
  api_url: z.string().url('A URL deve ser válida (ex: https://api.meozap.com)'),
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

  const onSubmit = async (data: FormValues) => {
    const userId = pb.authStore.record?.id
    if (!userId) return

    setSaving(true)
    try {
      const payload: Partial<WhatsappConfig> = {
        id: configId || undefined,
        user: userId,
        api_url: data.api_url,
        token: data.token,
        instance_id: data.instance_id,
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
      await pb.send('/backend/v1/whatsapp/test-connection', {
        method: 'POST',
        body: JSON.stringify({
          api_url: values.api_url,
          token: values.token,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      setStatus('success')
      toast.success('Conexão estabelecida com sucesso!')
    } catch (e) {
      setStatus('error')
      toast.error('Falha ao conectar com a API. Verifique a URL e o Token.')
    } finally {
      setTesting(false)
    }
  }

  const pbUrl = import.meta.env.VITE_POCKETBASE_URL || window.location.origin
  const webhookUrl = `${pbUrl}/backend/v1/meo-zap/webhook`

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integração WhatsApp API</h1>
        <p className="text-muted-foreground">
          Configure a conexão com seu servidor MEO Zap ou Hostinger VPS.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" /> Credenciais da API
          </CardTitle>
          <CardDescription>
            Insira os dados de conexão do seu servidor para sincronizar leads automaticamente com o
            CRM.
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
                    <FormLabel>URL da API (Hostinger VPS)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://api.seudominio.com" {...field} />
                    </FormControl>
                    <FormDescription>A URL base da sua instância do WhatsApp.</FormDescription>
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
                      <FormLabel>ID da Instância</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: inst_12345" {...field} />
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
                      <FormLabel>Token de Autenticação</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu token de acesso" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={testConnection}
                  disabled={testing || saving}
                >
                  {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Testar Conexão
                </Button>
                <Button type="submit" disabled={saving || testing}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Salvar Configurações
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
                  Conexão verificada com sucesso! Seu CRM está pronto.
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

      <Card>
        <CardHeader>
          <CardTitle>Webhook para Recebimento</CardTitle>
          <CardDescription>
            Configure esta URL no seu servidor VPS para enviar novos leads e mensagens recebidas
            para o CRM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-muted rounded-md flex items-center justify-between">
            <code className="text-sm break-all">{webhookUrl}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(webhookUrl)
                toast.success('URL copiada!')
              }}
            >
              Copiar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            O payload deve ser enviado via POST (application/json) contendo <code>name</code>,{' '}
            <code>phone</code> e <code>instance_id</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
