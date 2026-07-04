import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface AiAssistantContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  messages: Message[]
  sendMessage: (msg: string) => Promise<void>
  isLoading: boolean
  connectionStatus: 'connecting' | 'connected' | 'error'
  retryConnection: () => Promise<void>
}

const AiAssistantContext = createContext<AiAssistantContextType | undefined>(undefined)

export function useAiAssistant() {
  const context = useContext(AiAssistantContext)
  if (!context) {
    throw new Error('useAiAssistant must be used within an AiAssistantProvider')
  }
  return context
}

export function AiAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return sessionStorage.getItem('vallen_chat_open') === 'true'
    } catch {
      return false
    }
  })

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = sessionStorage.getItem('vallen_chat_history')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch {
      // Ignore parsing errors
    }
    return [
      {
        role: 'assistant',
        content:
          'Olá! Sou a VALLEN IA, sua consultora de negócios da V MODA BRASIL. Como posso ajudar a otimizar suas vendas hoje?',
      },
    ]
  })

  const [isLoading, setIsLoading] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>(
    'connecting',
  )

  const initChatConnection = async () => {
    try {
      setConnectionStatus('connecting')
      await pb.health.check()

      try {
        await pb.collection('brand_settings').getList(1, 1)
      } catch (dbErr) {
        console.warn('[VALLEN IA] Collection access check failed:', dbErr)
      }

      setConnectionStatus('connected')
    } catch (error) {
      console.error('[VALLEN IA] Connection failed:', error)
      setConnectionStatus('error')
    }
  }

  useEffect(() => {
    setHasInitialized(true)
    initChatConnection()
  }, [])

  useEffect(() => {
    if (!hasInitialized) return
    try {
      sessionStorage.setItem('vallen_chat_history', JSON.stringify(messages))
    } catch {
      // Ignore storage errors
    }
  }, [messages, hasInitialized])

  useEffect(() => {
    if (!hasInitialized) return
    try {
      sessionStorage.setItem('vallen_chat_open', String(isOpen))
    } catch {
      // Ignore storage errors
    }
  }, [isOpen, hasInitialized])

  const sendWithRetry = async (apiMessages: Message[], retries = 2): Promise<string> => {
    try {
      const currentPath = window?.location?.pathname || '/'
      const isGuest = !pb.authStore.isValid
      const contextFlag = currentPath.includes('/login')
        ? 'guest_login_page'
        : isGuest
          ? 'guest'
          : 'dashboard'

      const res = await pb.send('/backend/v1/vallen-chat', {
        method: 'POST',
        body: { messages: apiMessages, context: contextFlag },
      })
      if (res && res.reply) return res.reply
      throw new Error('Invalid response structure')
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return sendWithRetry(apiMessages, retries - 1)
      }
      throw error
    }
  }

  const sendMessage = async (userMsg: string) => {
    if (!userMsg.trim() || isLoading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg.trim() }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const reply = await sendWithRetry(newMessages)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (error) {
      console.error('VALLEN IA Chat Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Desculpe, ocorreu uma instabilidade na conexão. Por favor, tente novamente.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const retryConnection = async () => {
    await initChatConnection()
  }

  if (!hasInitialized) {
    return <>{children}</>
  }

  return (
    <AiAssistantContext.Provider
      value={{
        isOpen,
        setIsOpen,
        messages,
        sendMessage,
        isLoading,
        connectionStatus,
        retryConnection,
      }}
    >
      {children}
    </AiAssistantContext.Provider>
  )
}

export function LiveChat() {
  const context = useContext(AiAssistantContext)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (context?.isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [context?.messages, context?.isOpen])

  if (!context) return null

  const { isOpen, setIsOpen, messages, sendMessage, isLoading, connectionStatus, retryConnection } =
    context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    const msg = inputValue
    setInputValue('')
    await sendMessage(msg)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-background border border-border shadow-2xl w-[350px] sm:w-[400px] rounded-lg overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-5">
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

          {connectionStatus === 'error' && (
            <div className="bg-destructive/10 text-destructive p-2 text-xs flex items-center justify-between shrink-0">
              <span>Sem conexão com o servidor.</span>
              <Button
                variant="link"
                size="sm"
                onClick={retryConnection}
                className="h-auto p-0 text-destructive underline font-semibold"
              >
                Tentar novamente
              </Button>
            </div>
          )}
          {connectionStatus === 'connecting' && (
            <div className="bg-muted text-muted-foreground p-2 text-xs flex items-center justify-center shrink-0 gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Conectando...
            </div>
          )}

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

          <div className="p-4 border-t bg-background shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escreva sua mensagem..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim() || isLoading}>
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
