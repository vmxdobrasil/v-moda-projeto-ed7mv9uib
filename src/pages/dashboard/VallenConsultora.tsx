import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Sparkles, MessageSquare, Instagram, Copy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { streamAgentChat, displayableMessages, DisplayMessage } from '@/lib/skipAi'
import { useToast } from '@/hooks/use-toast'

export default function VallenConsultora() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadRecentChat()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const loadRecentChat = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/vallen-consultora/chats`,
        {
          headers: { Authorization: pb.authStore.token },
        },
      )
      if (res.ok) {
        const data = await res.json()
        if (data.items && data.items.length > 0) {
          const convId = data.items[0].id
          setConversationId(convId)
          const histRes = await fetch(
            `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/vallen-consultora/chats/${convId}/messages`,
            {
              headers: { Authorization: pb.authStore.token },
            },
          )
          if (histRes.ok) {
            const histData = await histRes.json()
            setMessages(displayableMessages(histData.messages || []))
          }
        } else {
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content:
                'Olá! Sou a Vallen Consultora. Estou aqui para ajudar você a turbinar suas vendas, criar scripts para o WhatsApp e copys para o Instagram. Como posso te ajudar hoje?',
              created: new Date().toISOString(),
            },
          ])
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      created: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const abortController = new AbortController()

    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/vallen-consultora`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: pb.authStore.token },
          body: JSON.stringify({ message: text, conversation_id: conversationId }),
          signal: abortController.signal,
        },
      )

      const result = await streamAgentChat(res, {
        onChunk: (_, full) => {
          setMessages((prev) => {
            const copy = [...prev]
            if (
              copy[copy.length - 1].role === 'assistant' &&
              copy[copy.length - 1].id === 'typing'
            ) {
              copy[copy.length - 1].content = full
            } else {
              copy.push({
                id: 'typing',
                role: 'assistant',
                content: full,
                created: new Date().toISOString(),
              })
            }
            return copy
          })
        },
        signal: abortController.signal,
      })

      setConversationId(result.conversation_id)

      setMessages((prev) => {
        const copy = [...prev]
        if (copy[copy.length - 1].id === 'typing') {
          copy[copy.length - 1].id = result.message_id
          copy[copy.length - 1].content = result.content
        }
        return copy
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Falha ao se comunicar com a Vallen.',
      })
      setMessages((prev) => prev.filter((m) => m.id !== 'typing'))
    } finally {
      setIsTyping(false)
    }
  }

  const quickActions = [
    {
      label: 'Script WhatsApp (Abordagem)',
      icon: MessageSquare,
      prompt:
        'Crie um script curto e atrativo para abordar clientes inativas no WhatsApp promovendo a nova coleção, usando a técnica dos 7 looks.',
    },
    {
      label: 'Copy Instagram (Reels)',
      icon: Instagram,
      prompt:
        'Crie uma copy para um Reels no Instagram mostrando 3 looks diferentes usando a mesma calça jeans. Tom profissional e convidativo.',
    },
    {
      label: 'Dica de Vendas (Fechamento)',
      icon: Sparkles,
      prompt:
        'Me dê 3 dicas práticas para contornar a objeção "achei caro" durante uma venda consultiva no WhatsApp.',
    },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copiado!', description: 'Texto copiado para a área de transferência.' })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in-up">
      <div className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Vallen Consultora</h2>
        <p className="text-muted-foreground">Sua assistente de marketing e vendas por IA.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="md:col-span-1 space-y-4 order-2 md:order-1 flex flex-col">
          <Card className="flex-1 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-3 bg-background hover:bg-muted"
                  onClick={() => sendMessage(action.prompt)}
                  disabled={isTyping}
                >
                  <action.icon className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                  <span className="text-xs whitespace-normal">{action.label}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-3 flex flex-col order-1 md:order-2">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[80%] rounded-xl p-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {msg.role === 'assistant' && msg.id !== 'typing' && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={() => copyToClipboard(msg.content)}
                      >
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-background rounded-b-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(input)
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Peça um script ou dica de venda..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                className="flex-1"
              />
              <Button type="submit" disabled={isTyping || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
