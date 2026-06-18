import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Sparkles, BookOpen, MapPin, Tag } from 'lucide-react'
import { streamAgentChat, type DisplayMessage } from '@/lib/skipAi'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function VallenGuiaModaChat() {
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

  if (!user) {
    return (
      <div className="flex flex-col h-full bg-background">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Bot className="w-5 h-5" />
            </div>
            Vallen Guia de Moda
          </CardTitle>
        </CardHeader>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Bot className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-serif text-primary">Consultoria Exclusiva</h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Faça login para conversar com nossa IA especialista e descobrir as melhores marcas e
            condições de compra.
          </p>
          <Button asChild className="w-full max-w-[200px] mt-4 rounded-full">
            <Link to="/login">Fazer Login</Link>
          </Button>
        </div>
      </div>
    )
  }

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
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/ask-vallen-guia-moda-stream`,
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
      icon: BookOpen,
      label: 'Regras de Atacado',
      text: 'Quais as regras gerais de compra no atacado para as marcas disponíveis?',
    },
    {
      icon: Tag,
      label: 'Buscar Categorias',
      text: 'Pode me indicar marcas que vendem Moda Plus Size?',
    },
    {
      icon: MapPin,
      label: 'Busca por Região',
      text: 'Quais marcas estão localizadas em São Paulo?',
    },
  ]

  return (
    <div className="flex flex-col h-full bg-background">
      <CardHeader className="border-b bg-muted/30 pb-4 shrink-0">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          Vallen Guia de Moda
        </CardTitle>
      </CardHeader>

      <div className="flex-1 overflow-hidden relative bg-muted/5">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 text-muted-foreground p-4 animate-fade-in">
              <Bot className="w-16 h-16 opacity-20 text-primary" />
              <p className="max-w-[280px] text-sm">
                Olá! Sou a Vallen. Especialista em curadoria de moda. Me pergunte sobre regras de
                varejo/atacado ou peça recomendações de marcas.
              </p>

              <div className="flex flex-col gap-2 w-full mt-4">
                {quickPrompts.map((p, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-3 justify-start text-left bg-background hover:bg-muted/50 transition-colors border-primary/20"
                    onClick={() => sendPrompt(p.text)}
                  >
                    <p.icon className="w-4 h-4 mr-3 text-primary shrink-0" />
                    <span className="text-xs whitespace-normal">{p.label}</span>
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
      </div>

      <div className="p-4 border-t bg-background shrink-0">
        <form onSubmit={handleSubmit} className="flex w-full gap-2 relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre atacado ou marcas..."
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
      </div>
    </div>
  )
}
