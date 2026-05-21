import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return sessionStorage.getItem('vallen_chat_open') === 'true'
    } catch {
      return false
    }
  })
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>(
    () => {
      try {
        const stored = sessionStorage.getItem('vallen_chat_history')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        }
      } catch {
        /* intentionally ignored */
      }
      return [
        {
          role: 'assistant',
          content:
            'Olá! Sou a VALLEN IA, sua consultora de negócios da V MODA BRASIL. Como posso ajudar a otimizar suas vendas hoje?',
        },
      ]
    },
  )
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      sessionStorage.setItem('vallen_chat_history', JSON.stringify(messages))
    } catch {
      /* intentionally ignored */
    }
  }, [messages])

  useEffect(() => {
    try {
      sessionStorage.setItem('vallen_chat_open', String(isOpen))
    } catch {
      /* intentionally ignored */
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const userMsg = message.trim()
    setMessage('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
      const apiMessages = messages
        .map((m) => ({ role: m.role, content: m.content }))
        .concat({
          role: 'user',
          content: userMsg,
        })

      const res = await pb.send('/backend/v1/vallen-chat', {
        method: 'POST',
        body: { messages: apiMessages },
      })

      if (res && res.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }])
      }
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-background border border-border shadow-2xl w-[350px] sm:w-[400px] rounded-lg overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center shrink-0">
            <h3 className="font-medium flex items-center gap-2">
              <Bot className="w-5 h-5" /> VALLEN IA
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:opacity-70 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4 bg-muted/20 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-start gap-2 max-w-[85%]',
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : '',
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground',
                    )}
                  >
                    {msg.role === 'user' ? (
                      <UserIcon className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'p-3 rounded-lg text-sm whitespace-pre-wrap',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-secondary text-secondary-foreground rounded-tl-none',
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-secondary text-secondary-foreground">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-lg text-sm bg-secondary text-secondary-foreground rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Digitando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-background shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva sua mensagem..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={!message.trim() || isLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="sr-only">Fale Conosco</span>
        </Button>
      )}
    </div>
  )
}
