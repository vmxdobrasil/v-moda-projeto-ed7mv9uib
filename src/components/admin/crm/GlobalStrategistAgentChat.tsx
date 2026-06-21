import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, Loader2 } from 'lucide-react'
import { streamAgentChat, type DisplayMessage } from '@/lib/skipAi'
import pb from '@/lib/pocketbase/client'

export function GlobalStrategistAgentChat() {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortController = useRef<AbortController | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userText = input.trim()
    setInput('')
    setLoading(true)

    const tempId = crypto.randomUUID()
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: 'user', content: userText, created: new Date().toISOString() },
    ])

    const ac = new AbortController()
    abortController.current = ac

    try {
      const token = pb.authStore.token
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/admin-strategist-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({ message: userText, conversation_id: conversationId }),
          signal: ac.signal,
        },
      )

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

      setConversationId(res.headers.get('X-Conversation-Id') || result.conversation_id)
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(err)
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Ocorreu um erro ao consultar o agente. Tente novamente.',
            created: new Date().toISOString(),
          },
        ])
      }
    } finally {
      setLoading(false)
      abortController.current = null
    }
  }

  return (
    <Card className="h-[600px] flex flex-col border border-border shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-orange-600" />
          Estrategista V MODA (OODA)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 bg-background/50">
        <ScrollArea className="h-full px-6 py-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-4 opacity-70">
              <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Bot className="h-8 w-8 text-orange-600" />
              </div>
              <p className="max-w-sm">
                Olá! Sou seu assistente estratégico. Como posso ajudar a analisar o ecossistema V
                MODA hoje?
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-orange-600" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap text-sm ${
                      msg.role === 'user'
                        ? 'bg-orange-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white border rounded-bl-none shadow-sm text-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-white border rounded-bl-none flex items-center shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="Pergunte sobre tendências, fechamentos ou saúde financeira..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="focus-visible:ring-orange-500"
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-orange-600 hover:bg-orange-700 text-white shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
