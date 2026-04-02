import { useState, useEffect, useMemo, useRef } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getChannels,
  getMessages,
  sendMessage,
  updateMessage,
  updateChannel,
  getAiSuggestion,
  Channel,
  Message,
} from '@/services/ai_service'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Bot,
  Send,
  Search,
  Instagram,
  Mail,
  MessageCircle,
  Settings,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ChannelIcon = ({ type, className }: { type: string; className?: string }) => {
  if (type === 'whatsapp') return <MessageCircle className={cn('text-green-500', className)} />
  if (type === 'instagram') return <Instagram className={cn('text-pink-500', className)} />
  return <Mail className={cn('text-blue-500', className)} />
}

export function AICustomerServiceTab() {
  const { toast } = useToast()
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeSenderId, setActiveSenderId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadData = async () => {
    try {
      setChannels(await getChannels())
      setMessages(await getMessages())
    } catch (e) {
      console.error('Failed to load AI Service data')
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('messages', () => {
    getMessages().then(setMessages).catch(console.error)
  })

  const threads = useMemo(() => {
    const map = new Map<string, Message[]>()
    messages.forEach((m) => {
      const list = map.get(m.sender_id) || []
      list.push(m)
      map.set(m.sender_id, list)
    })
    return Array.from(map.entries())
      .map(([sender_id, msgs]) => {
        msgs.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
        return {
          sender_id,
          sender_name: msgs[0].sender_name || 'Desconhecido',
          channel: msgs[0].expand?.channel,
          messages: msgs,
          latest: msgs[msgs.length - 1],
          unread: msgs.filter((m) => m.direction === 'inbound' && m.status === 'pending').length,
        }
      })
      .sort((a, b) => new Date(b.latest.created).getTime() - new Date(a.latest.created).getTime())
  }, [messages])

  const activeThread = threads.find((t) => t.sender_id === activeSenderId)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [activeThread?.messages.length])

  const handleToggleChannel = async (id: string, status: boolean) => {
    await updateChannel(id, { status })
    setChannels(channels.map((c) => (c.id === id ? { ...c, status } : c)))
    toast({ title: 'Canal atualizado' })
  }

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeThread) return
    const channelId = activeThread.channel?.id || channels[0]?.id

    await sendMessage({
      channel: channelId,
      sender_id: activeThread.sender_id,
      sender_name: activeThread.sender_name,
      content: text,
      direction: 'outbound',
      status: 'replied',
    })

    const pending = activeThread.messages.filter(
      (m) => m.direction === 'inbound' && m.status === 'pending',
    )
    for (const p of pending) {
      await updateMessage(p.id, { status: 'replied' })
    }
    setReplyText('')
  }

  const handleGenerateAi = async (msg: Message) => {
    setIsGeneratingAi(true)
    try {
      const res = await getAiSuggestion(msg.content)
      await updateMessage(msg.id, { ai_suggested_reply: res.suggested_reply })
      setMessages(await getMessages())
    } catch (e) {
      toast({ title: 'Erro na IA', variant: 'destructive' })
    } finally {
      setIsGeneratingAi(false)
    }
  }

  return (
    <Tabs
      defaultValue="inbox"
      className="h-[600px] flex flex-col border rounded-lg bg-card animate-in fade-in"
    >
      <div className="p-2 border-b flex items-center bg-muted/20">
        <TabsList>
          <TabsTrigger value="inbox" className="gap-2">
            <MessageSquare size={16} /> Caixa de Entrada
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings size={16} /> Configurações de Canais
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="inbox" className="flex-1 flex m-0 overflow-hidden outline-none">
        <div className="w-1/3 border-r flex flex-col bg-muted/10">
          <div className="p-4 border-b relative">
            <Search className="absolute left-6 top-6 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar conversas..." className="pl-9 bg-background" />
          </div>
          <ScrollArea className="flex-1">
            {threads.map((t) => (
              <button
                key={t.sender_id}
                onClick={() => setActiveSenderId(t.sender_id)}
                className={cn(
                  'flex items-start gap-3 p-4 text-left w-full transition-colors border-b hover:bg-muted/50',
                  activeSenderId === t.sender_id && 'bg-muted',
                )}
              >
                <div className="relative">
                  <Avatar className="w-10 h-10 border">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {t.sender_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {t.channel && (
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                      <ChannelIcon type={t.channel.type} className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm truncate">{t.sender_name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(t.latest.created).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.latest.content}</p>
                </div>
                {t.unread > 0 && (
                  <Badge
                    variant="default"
                    className="w-5 h-5 flex items-center justify-center p-0 rounded-full"
                  >
                    {t.unread}
                  </Badge>
                )}
              </button>
            ))}
          </ScrollArea>
        </div>

        {activeThread ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b flex items-center gap-3 bg-card shadow-sm z-10">
              <Avatar className="w-10 h-10 border">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {activeThread.sender_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{activeThread.sender_name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {activeThread.channel && (
                    <>
                      <ChannelIcon type={activeThread.channel.type} className="w-3 h-3" /> via{' '}
                      {activeThread.channel.name}
                    </>
                  )}
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex flex-col gap-4">
                {activeThread.messages.map((msg, i) => {
                  const isLastInbound =
                    msg.direction === 'inbound' &&
                    i === activeThread.messages.length - 1 &&
                    msg.status === 'pending'
                  return (
                    <div key={msg.id} className="flex flex-col">
                      <div
                        className={cn(
                          'max-w-[80%] rounded-lg p-3 text-sm shadow-sm',
                          msg.direction === 'outbound'
                            ? 'bg-primary text-primary-foreground ml-auto rounded-tr-sm'
                            : 'bg-card border rounded-tl-sm',
                        )}
                      >
                        <p>{msg.content}</p>
                        <span
                          className={cn(
                            'text-[10px] mt-1 block opacity-70',
                            msg.direction === 'outbound' ? 'text-right' : 'text-left',
                          )}
                        >
                          {new Date(msg.created).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {isLastInbound && (
                        <div className="mt-3">
                          {msg.ai_suggested_reply ? (
                            <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900 text-sm w-[85%] animate-in slide-in-from-left-2">
                              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium mb-2">
                                <Bot size={14} /> Sugestão da IA
                              </div>
                              <p className="text-muted-foreground">{msg.ai_suggested_reply}</p>
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => setReplyText(msg.ai_suggested_reply)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() => handleSend(msg.ai_suggested_reply)}
                                >
                                  Usar e Enviar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950"
                              onClick={() => handleGenerateAi(msg)}
                              disabled={isGeneratingAi}
                            >
                              <Bot className="w-4 h-4" />{' '}
                              {isGeneratingAi ? 'Analisando...' : 'Gerar Resposta com IA'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-card">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend(replyText)
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Digite sua mensagem..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!replyText.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Bot className="w-12 h-12 mb-4 opacity-20" />
            <p>Selecione uma conversa para iniciar o Atendimento IA</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="settings" className="p-6 m-0 overflow-y-auto outline-none">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">Canais de Comunicação</h2>
          <p className="text-muted-foreground mb-8">
            Gerencie as integrações da sua marca para centralizar todas as mensagens no Atendimento
            IA.
          </p>

          <div className="grid gap-4">
            {channels.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-full">
                    <ChannelIcon type={c.type} className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-base">{c.name}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {c.status ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-green-500" /> Conectado e recebendo
                          mensagens
                        </>
                      ) : (
                        'Desconectado'
                      )}
                    </p>
                  </div>
                </div>
                <Switch checked={c.status} onCheckedChange={(s) => handleToggleChannel(c.id, s)} />
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
