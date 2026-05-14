import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useWhatsappStore } from '@/stores/useWhatsappStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { MessageSquare, Send, Loader2, Phone, AlertCircle, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function WhatsappStatusWidget() {
  const { status, errorMessage, setStatus } = useWhatsappStore()
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [phone, setPhone] = useState('5562992156222')
  const [message, setMessage] = useState('Teste de conexão - Evolution API')
  const [sending, setSending] = useState(false)
  const [identity, setIdentity] = useState<{ name?: string; number?: string }>({})
  const [instances, setInstances] = useState<string[]>([])
  const [selectedInstance, setSelectedInstance] = useState<string>('')
  const [failCount, setFailCount] = useState(0)

  const fetchStatus = async (isManualRefresh = false) => {
    if (!isManualRefresh && failCount >= 3) {
      setStatus('offline', 'Serviço offline (Múltiplas falhas)')
      setLoading(false)
      return
    }

    setLoading(true)
    setStatus('connecting', null)

    try {
      const user = pb.authStore.record
      if (!user || !pb.authStore.isValid) {
        setStatus('auth_error', 'Sessão expirada. Por favor, faça login para testar a conexão.')
        setLoading(false)
        return
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      try {
        const config = await pb
          .collection('whatsapp_configs')
          .getFirstListItem(`user="${user.id}"`, { signal: controller.signal })
          .catch(() => null)

        const availableInstances = config?.instance_id
          ? config.instance_id.split(',').map((i: string) => i.trim())
          : ['vmodabrasil']
        setInstances(availableInstances)

        const instanceToTest = selectedInstance || availableInstances[0] || 'vmodabrasil'
        if (!selectedInstance && availableInstances.length > 0) {
          setSelectedInstance(availableInstances[0])
        }

        const res = await pb.send(
          `/backend/v1/evolution_api/status${instanceToTest ? `?instance=${instanceToTest}` : ''}`,
          { method: 'GET', signal: controller.signal },
        )

        clearTimeout(timeoutId)
        setFailCount(0)

        if (res.state === 'auth_error') {
          setStatus('auth_error', res.error || 'Erro de Autenticação')
          setIdentity({ name: instanceToTest })
        } else if (res.state === 'offline') {
          setStatus('offline', res.error || 'Serviço Offline')
          setIdentity({ name: instanceToTest })
        } else if (res.state === 'disconnected') {
          setStatus('disconnected', res.error || 'Desconectado')
          setIdentity({ name: instanceToTest })
        } else if (res.instance?.state) {
          setStatus(res.instance.state, null)
          setIdentity({
            name: res.instance.profileName || res.instance.instanceName,
            number: res.instance.ownerJid?.split('@')[0] || res.instance.profileNumber,
          })
        } else if (res.state) {
          setStatus(res.state, null)
          setIdentity({
            name: res.profileName || res.instanceName,
            number: res.ownerJid?.split('@')[0] || res.profileNumber,
          })
        } else {
          setStatus('disconnected', 'Status desconhecido')
        }
      } catch (e: any) {
        clearTimeout(timeoutId)
        if (!isManualRefresh) {
          setFailCount((prev) => prev + 1)
        }
        setStatus(
          'offline',
          e.name === 'AbortError' || e.isAbort
            ? "Erro de Conexão: O servidor demorou muito para responder. Verifique se o serviço 'evolution' está rodando no Easypanel."
            : 'Falha de conexão com a API',
        )
        setIdentity({ name: selectedInstance || 'vmodabrasil' })
      }
    } catch (e) {
      if (!isManualRefresh) {
        setFailCount((prev) => prev + 1)
      }
      setStatus('offline', 'Falha interna ao processar o status')
    } finally {
      setLoading(false)
    }
  }

  // Polling intervals and on-mount background connection checks removed.
  // External service pings must only happen manually (e.g., via refresh button)
  // to prevent dashboard blocking and infinite loading loops.

  const handleSendTest = async () => {
    if (!phone || !message) {
      toast.error('Preencha o telefone e a mensagem')
      return
    }
    setSending(true)
    try {
      const user = pb.authStore.record
      if (!user) throw new Error('Usuário não autenticado')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      try {
        let channel = await pb
          .collection('channels')
          .getFirstListItem(`type="whatsapp"`, { signal: controller.signal })
          .catch(() => null)
        if (!channel) {
          channel = await pb
            .collection('channels')
            .create(
              { name: 'WhatsApp Principal', type: 'whatsapp', status: true },
              { signal: controller.signal },
            )
        }

        await pb.send('/backend/v1/evolution_api/send', {
          method: 'POST',
          body: JSON.stringify({ phone, message, instance_id: selectedInstance || 'vmodabrasil' }),
          signal: controller.signal,
        })

        await pb.collection('messages').create(
          {
            channel: channel.id,
            sender_id: user.id,
            sender_name: user.name || user.email,
            content: message,
            direction: 'outbound',
            status: 'replied',
          },
          { signal: controller.signal },
        )

        clearTimeout(timeoutId)
      } catch (e: any) {
        clearTimeout(timeoutId)
        if (e.name === 'AbortError' || e.isAbort) {
          throw new Error(
            "Erro de Conexão: O servidor demorou muito para responder. Verifique se o serviço 'evolution' está rodando no Easypanel.",
          )
        }
        throw e
      }

      toast.success('Mensagem enviada com sucesso!')
      setIsDialogOpen(false)
    } catch (e: any) {
      const specificError = e?.response?.message || e.message || 'Falha ao conectar'
      toast.error(`Falha ao enviar mensagem de teste: ${specificError}`)
    } finally {
      setSending(false)
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return 'bg-green-500/15 text-green-700 border-green-500/30'
      case 'connecting':
        return 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30'
      case 'offline':
      case 'auth_error':
      case 'disconnected':
      default:
        return 'bg-red-500/15 text-red-700 border-red-500/30'
    }
  }

  const getStatusLabel = () => {
    if (status === 'auth_error' && errorMessage?.includes('login')) {
      return 'Login necessário'
    }
    switch (status) {
      case 'open':
        return 'Serviço Online'
      case 'connecting':
        return 'Conectando...'
      case 'offline':
      case 'auth_error':
      case 'disconnected':
      default:
        return 'Serviço offline'
    }
  }

  return (
    <div className="flex items-center gap-2">
      {identity.number && status === 'open' && (
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border/50 animate-fade-in">
          <Phone className="h-3 w-3" />
          <span className="font-medium">{identity.number}</span>
          {identity.name && (
            <span className="opacity-70 truncate max-w-[120px]">({identity.name})</span>
          )}
        </div>
      )}

      <Badge
        variant="outline"
        className={cn(
          'gap-1.5 px-2.5 py-1 hidden md:inline-flex transition-colors cursor-default',
          getStatusColor(),
        )}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              status === 'open'
                ? 'bg-green-500'
                : status === 'connecting'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-red-500',
            )}
          />
        )}
        <span className="font-medium text-xs">{getStatusLabel()}</span>
      </Badge>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hidden sm:flex"
        onClick={() => fetchStatus(true)}
        disabled={loading}
        title="Atualizar Status"
      >
        <RefreshCcw
          className={cn(
            'h-4 w-4 text-muted-foreground hover:text-foreground',
            loading && 'animate-spin',
          )}
        />
      </Button>

      {status !== 'open' && status !== 'connecting' && (
        <Link
          to="/settings"
          className="text-[10px] text-muted-foreground hover:text-primary underline underline-offset-2 ml-1 hidden lg:inline-block"
        >
          acesse as configurações para testar a conexão
        </Link>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs hidden sm:flex ml-1"
            disabled={status !== 'open' && status !== 'connecting'}
            title={
              status === 'auth_error' && errorMessage?.includes('login')
                ? 'Login necessário para testar conexão.'
                : status !== 'open' && status !== 'connecting'
                  ? 'Serviço offline. Não é possível enviar mensagem.'
                  : 'Testar Mensagem'
            }
          >
            <Send className="h-3.5 w-3.5" />
            Testar Mensagem
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Enviar Mensagem de Teste
            </DialogTitle>
            <DialogDescription>
              Verifique a conexão da Evolution API enviando uma mensagem de teste para o seu
              WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {instances.length > 1 && (
              <div className="grid gap-2">
                <Label htmlFor="instance">Instância de Envio</Label>
                <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a instância" />
                  </SelectTrigger>
                  <SelectContent>
                    {instances.map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone de Destino (com DDI e DDD)</Label>
              <Input
                id="phone"
                placeholder="Ex: 5511999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Sua mensagem de teste..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendTest} disabled={sending}>
              {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Teste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
