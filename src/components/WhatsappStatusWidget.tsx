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
import { MessageSquare, Send, Loader2, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function WhatsappStatusWidget() {
  const [status, setStatus] = useState<'open' | 'close' | 'connecting' | 'disconnected'>(
    'disconnected',
  )
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [identity, setIdentity] = useState<{ name?: string; number?: string }>({})

  const fetchStatus = async () => {
    try {
      const user = pb.authStore.model
      if (!user) return

      const config = await pb
        .collection('whatsapp_configs')
        .getFirstListItem(`user="${user.id}"`)
        .catch(() => null)

      const res = await pb.send('/backend/v1/evolution/status', { method: 'GET' }).catch(() => null)

      if (res?.instance?.state) {
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
      } else if (config?.instance_id) {
        setStatus('disconnected')
        setIdentity({ name: config.instance_id })
      } else {
        setStatus('disconnected')
      }
    } catch (e) {
      setStatus('disconnected')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSendTest = async () => {
    if (!phone || !message) {
      toast.error('Preencha o telefone e a mensagem')
      return
    }
    setSending(true)
    try {
      const user = pb.authStore.model
      if (!user) throw new Error('Usuário não autenticado')

      const config = await pb
        .collection('whatsapp_configs')
        .getFirstListItem(`user="${user.id}"`)
        .catch(() => null)

      let channel = await pb
        .collection('channels')
        .getFirstListItem(`type="whatsapp"`)
        .catch(() => null)
      if (!channel) {
        channel = await pb
          .collection('channels')
          .create({ name: 'WhatsApp Principal', type: 'whatsapp', status: true })
      }

      await pb.send('/backend/v1/evolution/send', {
        method: 'POST',
        body: JSON.stringify({ phone, message, instance_id: config?.instance_id }),
      })

      await pb.collection('messages').create({
        channel: channel.id,
        sender_id: user.id,
        sender_name: user.name || user.email,
        content: message,
        direction: 'outbound',
        status: 'replied',
      })

      toast.success('Message sent successfully!')
      setIsDialogOpen(false)
      setMessage('')
    } catch (e: any) {
      toast.error(
        e.message || 'Falha ao enviar mensagem de teste. Verifique se a instância está conectada.',
      )
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
      default:
        return 'bg-red-500/15 text-red-700 border-red-500/30'
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'open':
        return 'Conectado'
      case 'connecting':
        return 'Conectando...'
      default:
        return 'Desconectado'
    }
  }

  return (
    <div className="flex items-center gap-3">
      {identity.number && status === 'open' && (
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground mr-2 bg-muted/50 px-2 py-1 rounded-md border border-border/50 animate-fade-in">
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
          'gap-1.5 px-2.5 py-1 hidden md:inline-flex transition-colors',
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs hidden sm:flex">
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
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone (com DDI e DDD)</Label>
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
