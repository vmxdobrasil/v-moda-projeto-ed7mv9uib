import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { streamAgentChat, type DisplayMessage } from '@/lib/skipAi'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'

export function VallenGuiaChat({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { user } = useAuth()
  const navigate = useNavigate()
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
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/ask-vallen-guia-moda-stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: pb.authStore.token,
          },
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] h-[600px] p-0 flex flex-col overflow-hidden bg-white">
        <DialogHeader className="p-4 border-b bg-primary/5 text-primary shadow-sm flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <Sparkles className="w-5 h-5" />
            Vallen Guia de Moda
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative bg-zinc-50/50">
          <ScrollArea className="h-full p-4" ref={scrollRef}>
            {!user ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground p-8 animate-fade-in">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                  <Bot className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Acesso Restrito</h3>
                <p className="text-sm">
                  Faça login ou crie uma conta gratuitamente para conversar com a Vallen, nossa
                  consultora especializada em curadoria de moda.
                </p>
                <div className="flex gap-3 w-full mt-4">
                  <Button variant="outline" className="flex-1" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button className="flex-1" onClick={() => navigate('/login')}>
                    Criar Conta
                  </Button>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-4 text-muted-foreground p-8 animate-fade-in">
                <Bot className="w-16 h-16 opacity-20 text-primary" />
                <p className="max-w-[280px]">
                  Olá! Sou a Vallen, consultora do Guia de Moda. Como posso te ajudar a encontrar as
                  melhores peças para o seu negócio hoje?
                </p>
                <div className="flex flex-col gap-2 w-full mt-4">
                  <Button
                    variant="outline"
                    className="justify-start text-left h-auto py-2.5 hover:border-primary/50 transition-colors"
                    onClick={() =>
                      sendPrompt('Quais marcas de jeans têm o menor preço de atacado?')
                    }
                  >
                    Marcas de jeans com bom preço
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-left h-auto py-2.5 hover:border-primary/50 transition-colors"
                    onClick={() => sendPrompt('Estou procurando moda plus size no Brás.')}
                  >
                    Moda Plus Size no Brás
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
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
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-zinc-200 text-zinc-600 shadow-sm',
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
                        'px-4 py-3 rounded-2xl max-w-[85%] whitespace-pre-wrap text-[15px] leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-md'
                          : 'bg-white border border-gray-100 shadow-sm rounded-tl-sm text-gray-800',
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 flex-row">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center shrink-0 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="px-4 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-tl-sm flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="p-4 bg-white border-t flex-shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre marcas e produtos..."
              disabled={loading || !user}
              className="pr-12 h-12 bg-gray-50 focus-visible:bg-white"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || loading || !user}
              className="absolute right-1 top-1 bottom-1 h-10 w-10 shrink-0 rounded-md"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
