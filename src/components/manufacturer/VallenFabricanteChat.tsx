import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Sparkles, PenTool, Users, DollarSign, LayoutGrid } from 'lucide-react'
import { streamAgentChat, type DisplayMessage } from '@/lib/skipAi'
import { cn } from '@/lib/utils'

export function VallenFabricanteChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const sendPrompt = async (text: string) => {
    if (!text.trim() || !user) return

    const newMsg: DisplayMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      created: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newMsg])
    setInput('')
    setLoading(true)

    const ac = new AbortController()
    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/ask-vallen-fabricante-stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: pb.authStore.token },
          body: JSON.stringify({ message: text, conversation_id: conversationId }),
          signal: ac.signal,
        },
      )

      if (!res.ok) throw new Error('Falha ao comunicar com a IA')

      const convIdHeader = res.headers.get('X-Conversation-Id')
      if (convIdHeader && !conversationId) setConversationId(convIdHeader)

      const assistantId = crypto.randomUUID()
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', created: new Date().toISOString() },
      ])

      const result = await streamAgentChat(res, {
        onChunk: (_, full) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m)),
          )
        },
        signal: ac.signal,
      })

      if (result.conversation_id && !conversationId) {
        setConversationId(result.conversation_id)
      }
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro ao processar sua solicitação.',
          created: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendPrompt(input)
  }

  const quickPrompts = [
    {
      icon: LayoutGrid,
      label: 'Curadoria Catálogo',
      text: 'Me ajude a escolher os melhores produtos para minhas 8 páginas de catálogo.',
    },
    {
      icon: PenTool,
      label: 'Criar Copys',
      text: 'Gere um texto persuasivo para WhatsApp sobre meus produtos mais recentes.',
    },
    {
      icon: Users,
      label: 'Reativar VIPs',
      text: 'Quais dos meus clientes VIP (V Club) estão inativos há mais de 30 dias? Sugira uma mensagem de reativação.',
    },
    {
      icon: DollarSign,
      label: 'Revisar Preços',
      text: 'Analise meus preços de atacado e quantidades mínimas. Estão competitivos com o mercado?',
    },
  ]

  return (
    <Card className="flex flex-col h-[600px] shadow-lg border-primary/20">
      <CardHeader className="border-b bg-muted/30 pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          Vallen IA - Estrategista
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0 relative bg-muted/5">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 text-muted-foreground p-8 animate-fade-in">
              <Bot className="w-16 h-16 opacity-20 text-primary" />
              <p className="max-w-md">
                Olá! Sou a Vallen. Estou aqui para otimizar seu catálogo, gerar textos de vendas,
                analisar seus clientes VIP e sugerir melhorias de preço.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-4">
                {quickPrompts.map((p, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-3 justify-start text-left bg-background hover:bg-muted/50 transition-colors border-primary/20 hover:border-primary/50"
                    onClick={() => sendPrompt(p.text)}
                  >
                    <p.icon className="w-4 h-4 mr-3 text-primary shrink-0" />
                    <span className="text-sm">{p.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'px-4 py-3 rounded-2xl max-w-[80%] whitespace-pre-wrap text-sm',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-background border shadow-sm rounded-tl-sm',
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-background border shadow-sm rounded-tl-sm flex items-center gap-1">
                    <span
                      className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex w-full gap-2 relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Peça ajuda com o catálogo, copys ou VIPs..."
            className="flex-1 pr-10 bg-muted/50 border-transparent focus-visible:bg-background"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || loading}
            className="shrink-0 rounded-full shadow-sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
