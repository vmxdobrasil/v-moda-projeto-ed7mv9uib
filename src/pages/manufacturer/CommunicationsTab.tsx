import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Send, Users, Sparkles } from 'lucide-react'

export function CommunicationsTab() {
  const { toast } = useToast()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState('all')
  const [isSending, setIsSending] = useState(false)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !message) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o assunto e a mensagem.',
        variant: 'destructive',
      })
      return
    }

    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      toast({
        title: 'Comunicado Enviado',
        description: `Sua mensagem foi enviada para ${audience === 'all' ? 'todos os revendedores' : 'os top revendedores'}.`,
      })
      setSubject('')
      setMessage('')
    }, 1000)
  }

  return (
    <div className="space-y-6 animate-in fade-in max-w-2xl">
      <div>
        <h2 className="text-2xl font-serif mb-1">Comunicados e Notificações</h2>
        <p className="text-muted-foreground text-sm">
          Envie novidades e anúncios de coleções para seus revendedores.
        </p>
      </div>

      <form onSubmit={handleSend} className="space-y-6 mt-8">
        <div className="space-y-2">
          <label className="text-sm font-medium">Público-Alvo</label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o público" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Todos os Revendedores
                </div>
              </SelectItem>
              <SelectItem value="top">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Apenas Top Revendedores (VIP)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Assunto</label>
          <Input
            placeholder="Ex: Nova Coleção de Inverno Disponível"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Mensagem</label>
          <Textarea
            placeholder="Escreva sua mensagem aqui..."
            className="min-h-[200px] resize-y"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Esta mensagem será enviada por email e notificação no sistema.
          </p>
        </div>

        <Button type="submit" disabled={isSending} className="w-full md:w-auto gap-2">
          {isSending ? (
            'Enviando...'
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar Comunicado
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
