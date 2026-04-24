import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { MessageSquare, Bot, Clock, CheckCircle2, Archive, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function ManufacturerMessages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData()
    // eslint-next-line react-hooks/exhaustive-deps
  }, [user])

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

  const handleSendReply = async (msgId: string) => {
    const text = replyText[msgId]
    if (!text?.trim()) return

    try {
      await pb.collection('messages').update(msgId, { status: 'replied' })
      toast.success('Resposta enviada com sucesso!')
      setReplyText((prev) => ({ ...prev, [msgId]: '' }))
      loadData()
    } catch (error) {
      toast.error('Falha ao enviar resposta')
    }
  }

  const handleUseSuggestion = (msgId: string, suggestion: string) => {
    setReplyText((prev) => ({ ...prev, [msgId]: suggestion }))
  }

  const statusIcon = {
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    replied: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    archived: <Archive className="w-4 h-4 text-gray-400" />,
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mensagens</h2>
        <p className="text-muted-foreground">
          Gerencie as dúvidas dos clientes com sugestões baseadas em IA.
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
            <Card
              key={msg.id}
              className={msg.direction === 'inbound' ? 'border-l-4 border-l-primary' : ''}
            >
              <CardContent className="p-4 sm:p-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{msg.sender_name || 'Cliente'}</h3>
                  <Badge variant="outline" className="text-xs uppercase">
                    {msg.expand?.channel?.type || 'Canal'}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(msg.created).toLocaleString('pt-BR')}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm capitalize font-medium ml-4">
                    {statusIcon[msg.status as keyof typeof statusIcon]}
                    {msg.status === 'pending'
                      ? 'Pendente'
                      : msg.status === 'replied'
                        ? 'Respondido'
                        : 'Arquivado'}
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-md text-sm border whitespace-pre-wrap">
                  {msg.content}
                </div>

                {msg.direction === 'inbound' && msg.status === 'pending' && (
                  <div className="space-y-3 mt-2">
                    {msg.ai_suggested_reply && (
                      <div
                        className="flex gap-2 text-sm bg-primary/5 p-3 rounded-md border border-primary/20 text-primary cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => handleUseSuggestion(msg.id, msg.ai_suggested_reply)}
                        title="Clique para usar esta sugestão"
                      >
                        <Bot className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-xs mb-1 flex items-center gap-2">
                            Sugestão da IA{' '}
                            <Badge variant="secondary" className="text-[10px] h-4">
                              Clique para Usar
                            </Badge>
                          </p>
                          <p className="whitespace-pre-wrap">{msg.ai_suggested_reply}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Textarea
                          placeholder="Digite sua resposta..."
                          className="min-h-[80px]"
                          value={replyText[msg.id] || ''}
                          onChange={(e) =>
                            setReplyText((prev) => ({ ...prev, [msg.id]: e.target.value }))
                          }
                        />
                      </div>
                      <Button
                        onClick={() => handleSendReply(msg.id)}
                        disabled={!replyText[msg.id]?.trim()}
                      >
                        <Send className="w-4 h-4 mr-2" /> Enviar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
