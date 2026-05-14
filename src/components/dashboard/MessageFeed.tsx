import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowDownLeft, ArrowUpRight, MessageCircle } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

export function MessageFeed() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const records = await pb.collection('messages').getList(1, 10, {
        sort: '-created',
      })
      setMessages(records.items)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('messages', loadData)

  return (
    <Card className="border-border/50 shadow-sm flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Feed de Comunicações
        </CardTitle>
        <CardDescription>Últimas mensagens processadas pelo sistema</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto max-h-[400px]">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
            <MessageCircle className="h-10 w-10 opacity-20 mb-3" />
            <p className="text-sm font-medium">Nenhuma mensagem recente</p>
          </div>
        ) : (
          <div className="space-y-4 pr-2">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3 items-start group">
                <div className="shrink-0 mt-1">
                  {msg.direction === 'inbound' ? (
                    <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <ArrowDownLeft className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">
                      {msg.sender_name || msg.sender_id || 'Desconhecido'}
                    </p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {msg.created
                        ? formatDistanceToNow(new Date(msg.created), {
                            addSuffix: true,
                            locale: ptBR,
                          })
                        : ''}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words">
                    {msg.content}
                  </p>
                  {msg.ai_suggested_reply && (
                    <div className="text-[10px] mt-1 text-primary/80 bg-primary/5 px-2 py-1 rounded-sm line-clamp-1 border border-primary/10">
                      <strong>IA:</strong> {msg.ai_suggested_reply}
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                      {msg.direction === 'inbound' ? 'Recebida' : 'Enviada'}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-[9px] px-1.5 py-0 h-4 ${
                        msg.status === 'pending'
                          ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                          : msg.status === 'replied'
                            ? 'bg-primary/10 text-primary hover:bg-primary/20'
                            : ''
                      }`}
                    >
                      {msg.status === 'pending'
                        ? 'Pendente'
                        : msg.status === 'replied'
                          ? 'Respondida'
                          : 'Arquivada'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
