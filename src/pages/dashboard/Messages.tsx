import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Loader2 } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default function Messages() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const records = await pb.collection('messages').getFullList({
        sort: '-created',
      })
      setMessages(records)
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

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mensagens</h1>
        <p className="text-muted-foreground">
          Gerencie suas comunicações e conversas com clientes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Caixa de Entrada
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-medium">Nenhuma mensagem encontrada</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Sua caixa de entrada está limpa. Quando seus clientes enviarem mensagens pelos
                canais conectados, elas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {messages.map((msg) => (
                <div key={msg.id} className="p-4 hover:bg-muted/50 transition-colors flex gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {msg.sender_name || msg.sender_id || 'Desconhecido'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {msg.created ? format(new Date(msg.created), 'dd/MM/yyyy HH:mm') : '-'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground break-words">{msg.content}</p>
                    <div className="flex gap-2 pt-2">
                      <Badge variant={msg.direction === 'inbound' ? 'secondary' : 'outline'}>
                        {msg.direction === 'inbound' ? 'Recebida' : 'Enviada'}
                      </Badge>
                      <Badge
                        variant={
                          msg.status === 'pending'
                            ? 'destructive'
                            : msg.status === 'replied'
                              ? 'default'
                              : 'outline'
                        }
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
    </div>
  )
}
