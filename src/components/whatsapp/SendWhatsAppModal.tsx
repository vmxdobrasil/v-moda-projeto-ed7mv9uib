import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getTemplates, sendWhatsappMessage } from '@/services/whatsapp'
import { ensureWhatsappChannel, logMessage } from '@/services/messages'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Clock, Send } from 'lucide-react'

interface SendWhatsAppModalProps {
  isOpen: boolean
  onClose: () => void
  customer: any
}

export function SendWhatsAppModal({ isOpen, onClose, customer }: SendWhatsAppModalProps) {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom')
  const [messageContent, setMessageContent] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
      setMessageContent('')
      setSelectedTemplate('custom')
    }
  }, [isOpen])

  const loadTemplates = async () => {
    try {
      setTemplates(await getTemplates())
    } catch {
      /* intentionally ignored */
    }
  }

  const handleTemplateChange = (val: string) => {
    setSelectedTemplate(val)
    if (val === 'custom') {
      setMessageContent('')
      return
    }
    const tpl = templates.find((t) => t.id === val)
    if (tpl) {
      let content = tpl.content
      content = content.replace(/{{name}}/g, customer.name || '')
      content = content.replace(/{{status}}/g, customer.status || '')
      content = content.replace(/{{city}}/g, customer.city || '')
      setMessageContent(content)
    }
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast({
        title: 'Aviso',
        description: 'A mensagem não pode estar vazia.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSending(true)
      await sendWhatsappMessage(customer.phone, messageContent)

      const channelId = await ensureWhatsappChannel()
      await logMessage({
        channel: channelId,
        sender_id: customer.id,
        content: messageContent,
        direction: 'outbound',
        status: 'replied',
      })

      toast({ title: 'Sucesso', description: 'Mensagem enviada com sucesso!' })
      onClose()
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao enviar mensagem.',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Mensagem - WhatsApp</DialogTitle>
          <DialogDescription>
            Para: {customer?.name} ({customer?.phone})
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Template (Opcional)</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Mensagem Personalizada</SelectItem>
                {templates
                  .filter((t) => t.is_active)
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Mensagem</Label>
            <Textarea
              className="h-40"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Digite a mensagem..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSendMessage} disabled={isSending}>
            {isSending ? (
              <Clock className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
