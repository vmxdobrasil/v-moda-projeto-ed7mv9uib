import { useState, useEffect, useRef } from 'react'
import pb from '@/lib/pocketbase/client'
import { streamAgentChat, displayableMessages, type DisplayMessage } from '@/lib/skipAi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2, Bot, User } from 'lucide-react'

export function VallenFabricanteChat() {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadRecentConversation()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function loadRecentConversation() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/vallen-fabricante/chats?limit=1`,
        {
          headers: { Authorization: pb.authStore.token },
        },
      )
      if (!res.ok) return
      const data = await res.json()
      if (data.items && data.items.length > 0) {
        const cid = data.items[0].id
        setConversationId(cid)
        await loadHistory(cid)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function loadHistory(cid: string) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/vallen-fabricante/chats/${cid}/messages`,
        {
          headers: { Authorization: pb.authStore.token },
        },
      )
      if (!res.ok) return
      const data = await res.json()
      setMessages(displayableMessages(data.messages || []))
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userText = input.trim()
    setInput('')
    setLoading(true)

    const tempId = Date.now().toString()
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: 'user', content: userText, created: new Date().toISOString() },
    ])

    const ac = new AbortController()

    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/vallen-fabricante/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: pb.authStore.token },
          body: JSON.stringify({ message: userText, conversation_id: conversationId }),
          signal: ac.signal,
        },
      )

      const result = await streamAgentChat(res, {
        onChunk: (_delta, full) => {
          setMessages((prev) => {
            const hasAst = prev.find((m) => m.id === 'assistant-temp')
            if (hasAst) {
              return prev.map((m) => (m.id === 'assistant-temp' ? { ...m, content: full } : m))
            }
            return [
              ...prev,
              {
                id: 'assistant-temp',
                role: 'assistant',
                content: full,
                created: new Date().toISOString(),
              },
            ]
          })
        },
        signal: ac.signal,
      })

      setConversationId(result.conversation_id)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === 'assistant-temp'
            ? { ...m, id: result.message_id, citations: result.citations }
            : m,
        ),
      )
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Erro ao conectar com a Vallen. Tente novamente.',
          created: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Olá! Eu sou a Vallen. Como posso ajudar nas suas vendas hoje?</p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div
                className={`px-4 py-2 rounded-lg max-w-[85%] ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
          {loading && !messages.find((m) => m.id === 'assistant-temp') && (
            <div className="flex gap-3 flex-row">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-muted">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-4 py-2 rounded-lg bg-muted flex items-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-3 bg-card border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre estratégias, catálogo ou VIPs..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
