import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { MessageSquare, Bot, Clock, CheckCircle2, Archive } from 'lucide-react'

export default function ManufacturerMessages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) return
        const records = await pb
          .collection('messages')
          .getFullList({ expand: 'channel', sort: '-created' })
        setMessages(records)
      } catch (error) {
        console.error('Error loading messages', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const statusIcon = {
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    replied: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    archived: <Archive className="w-4 h-4 text-gray-400" />,
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Central de Comunicação</h2>
        <p className="text-muted-foreground">
          Gerencie as mensagens dos seus clientes (WhatsApp, Instagram).
        </p>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando mensagens...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            Nenhuma mensagem recebida.
          </div>
        ) : (
          messages.map((msg) => (
            <Card key={msg.id}>
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{msg.sender_name || 'Cliente'}</h3>
                    <Badge variant="outline" className="text-xs uppercase">
                      {msg.expand?.channel?.type || 'Canal'}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto sm:ml-0">
                      {new Date(msg.created).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md text-sm border whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  {msg.ai_suggested_reply && (
                    <div className="flex gap-2 text-sm bg-primary/5 p-3 rounded-md border border-primary/20 text-primary">
                      <Bot className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-xs mb-1">Sugestão da IA:</p>
                        <p className="whitespace-pre-wrap">{msg.ai_suggested_reply}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="sm:w-48 flex flex-col items-end sm:justify-center gap-2">
                  <div className="flex items-center gap-1.5 text-sm capitalize font-medium">
                    {statusIcon[msg.status as keyof typeof statusIcon]}
                    {msg.status === 'pending'
                      ? 'Pendente'
                      : msg.status === 'replied'
                        ? 'Respondido'
                        : 'Arquivado'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
