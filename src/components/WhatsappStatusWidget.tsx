import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
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

export function WhatsappStatusWidget() {
  const [status, setStatus] = useState<'open' | 'close' | 'connecting' | 'disconnected' | 'error'>(
    'disconnected',
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [phone, setPhone] = useState('5562992156222')
  const [message, setMessage] = useState('Teste de conexão - Evolution API')
  const [sending, setSending] = useState(false)
  const [identity, setIdentity] = useState<{ name?: string; number?: string }>({})
  const [instances, setInstances] = useState<string[]>([])
  const [selectedInstance, setSelectedInstance] = useState<string>('')

  const fetchStatus = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const user = pb.authStore.record
      if (!user) return

      const config = await pb
        .collection('whatsapp_configs')
        .getFirstListItem(`user="${user.id}"`)
        .catch(() => null)

      const availableInstances = config?.instance_id
        ? config.instance_id.split(',').map((i: string) => i.trim())
        : []
      setInstances(availableInstances)

      const instanceToTest = selectedInstance || availableInstances[0] || ''
      if (!selectedInstance && availableInstances.length > 0) {
        setSelectedInstance(availableInstances[0])
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      let res = null
      try {
        res = await pb.send(
          `/backend/v1/whatsapp/status${instanceToTest ? `?instance=${instanceToTest}` : ''}`,
          { method: 'GET', signal: controller.signal },
        )
      } catch (e: any) {
        console.warn('Evolution API status fetch failed', e)
        res = null
        setStatus('error')
        if (e.name === 'AbortError' || e.isAbort) {
          setErrorMessage('Serviço Indisponível (Timeout)')
        } else {
          const statusStr = e.status ? ` (${e.status})` : ''
          const msg = e.response?.error || e.message || 'Falha de conexão'
          setErrorMessage(`Serviço Indisponível${statusStr}: ${msg}`)
        }
        setIdentity({ name: instanceToTest })
      } finally {
        clearTimeout(timeoutId)
      }

      if (res) {
        if (res?.error && res.state === 'disconnected') {
          setStatus('error')
          setErrorMessage(res.error)
          setIdentity({ name: instanceToTest })
        } else if (res?.instance?.state) {
          setStatus(res.instance.state)
          setIdentity({
            name: res.instance.profileName || res.instance.instanceName,
            number: res.instance.ownerJid?.split('@')[0] || res.instance.profileNumber,
          })
        } else if (res?.state) {
          setStatus(res.state)
          setIdentity({
            name: res.profileName || res.instanceName,
            number: res.ownerJid?.split('@')[0] || res.profileNumber,
          })
        } else if (availableInstances.length > 0) {
          if (status !== 'error') setStatus('disconnected')
          setIdentity({ name: instanceToTest })
        } else {
          if (status !== 'error') setStatus('disconnected')
        }
      }
    } catch (e) {
      setStatus('error')
      setErrorMessage('Falha ao processar o status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [selectedInstance])

  const handleSendTest = async () => {
    if (!phone || !message) {
      toast.error('Preencha o telefone e a mensagem')
      return
    }
    setSending(true)
    try {
      const user = pb.authStore.record
      if (!user) throw new Error('Usuário não autenticado')

      let channel = await pb
        .collection('channels')
        .getFirstListItem(`type="whatsapp"`)
        .catch(() => null)
      if (!channel) {
        channel = await pb
          .collection('channels')
          .create({ name: 'WhatsApp Principal', type: 'whatsapp', status: true })
      }

      await pb.send('/backend/v1/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify({ phone, message, instance_id: selectedInstance }),
      })

      await pb.collection('messages').create({
        channel: channel.id,
        sender_id: user.id,
        sender_name: user.name || user.email,
        content: message,
        direction: 'outbound',
        status: 'replied',
      })

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
      case 'error':
        return 'bg-red-500/15 text-red-700 border-red-500/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'open':
        return 'Conectado'
      case 'connecting':
        return 'Conectando...'
      case 'error':
        return 'Serviço Indisponível'
      default:
        return 'Desconectado'
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'error' && (
        <div
          className="hidden lg:flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-md border border-destructive/20 animate-fade-in max-w-[250px]"
          title={errorMessage || 'Falha na API'}
        >
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span className="font-medium truncate">{errorMessage || 'Falha na API'}</span>
        </div>
      )}
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
                  : status === 'error'
                    ? 'bg-red-500'
                    : 'bg-muted-foreground',
            )}
          />
        )}
        <span className="font-medium text-xs">{getStatusLabel()}</span>
      </Badge>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hidden sm:flex"
        onClick={fetchStatus}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs hidden sm:flex ml-1">
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
