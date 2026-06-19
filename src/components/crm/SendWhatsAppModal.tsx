import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { Loader2, Send } from 'lucide-react'

interface SendWhatsAppModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: any
}

export function SendWhatsAppModal({ open, onOpenChange, customer }: SendWhatsAppModalProps) {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchTemplates()
      setMessage('')
      setSelectedTemplate('')
    }
  }, [open])

  const fetchTemplates = async () => {
    try {
      const records = await pb.collection('whatsapp_templates').getFullList({
        filter: 'is_active = true',
        sort: '-created',
      })
      setTemplates(records)
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      let content = template.content
      content = content.replace(/{{name}}/g, customer.name || '')
      content = content.replace(/{{status}}/g, customer.status || '')
      content = content.replace(/{{city}}/g, customer.city || '')
      setMessage(content)
    }
  }

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: 'Aviso',
        description: 'A mensagem não pode estar vazia.',
        variant: 'destructive',
      })
      return
    }

    if (!customer.phone) {
      toast({
        title: 'Aviso',
        description: 'O cliente não possui um número de telefone cadastrado.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await pb.send('/backend/v1/evolution_api/send', {
        method: 'POST',
        body: JSON.stringify({
          phone: customer.phone,
          message: message.trim(),
        }),
      })

      // Ensure a channel exists to save the message history
      let channelId = ''
      try {
        const channels = await pb
          .collection('channels')
          .getFullList({ filter: "type = 'whatsapp'", requestKey: null })
        if (channels.length > 0) {
          channelId = channels[0].id
        } else {
          const newChannel = await pb
            .collection('channels')
            .create({ name: 'WhatsApp', type: 'whatsapp', status: true })
          channelId = newChannel.id
        }

        await pb.collection('messages').create({
          channel: channelId,
          sender_id: user?.id,
          sender_name: user?.name || 'V Moda CRM',
          content: message.trim(),
          direction: 'outbound',
          status: 'replied',
        })
      } catch (err) {
        console.error('Failed to log message to history', err)
      }

      toast({ title: 'Sucesso', description: 'Mensagem enviada com sucesso.' })
      onOpenChange(false)
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro',
        description:
          error.message || 'Falha ao enviar mensagem. Verifique se o WhatsApp está conectado.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar WhatsApp</DialogTitle>
          <DialogDescription>
            Envie uma mensagem direta para {customer.name} ({customer.phone}).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template ou digite uma mensagem livre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Mensagem Livre</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              className="min-h-[150px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Variáveis suportadas nos templates: {'{{name}}'}, {'{{status}}'}, {'{{city}}'}.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={loading || !message.trim()}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Enviar Mensagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
