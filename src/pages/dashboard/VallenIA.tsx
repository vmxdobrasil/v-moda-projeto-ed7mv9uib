import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sparkles, Send, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function formatInline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-foreground/90">
          {part.slice(1, -1)}
        </em>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function formatMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: JSX.Element[] = []
  let listItems: JSX.Element[] = []
  let isList = false
  let isNumberedList = false

  const flushList = () => {
    if (listItems.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol
            key={`list-${elements.length}`}
            className="list-decimal pl-5 mb-3 space-y-1.5 text-foreground/90"
          >
            {listItems}
          </ol>,
        )
      } else {
        elements.push(
          <ul
            key={`list-${elements.length}`}
            className="list-disc pl-5 mb-3 space-y-1.5 text-foreground/90"
          >
            {listItems}
          </ul>,
        )
      }
      listItems = []
    }
    isList = false
    isNumberedList = false
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      isList = true
      listItems.push(<li key={i}>{formatInline(trimmed.substring(2))}</li>)
    } else if (trimmed.match(/^\d+\.\s/)) {
      isNumberedList = true
      const content = trimmed.replace(/^\d+\.\s/, '')
      listItems.push(<li key={i}>{formatInline(content)}</li>)
    } else {
      flushList()
      if (trimmed === '') {
        elements.push(<div key={`space-${i}`} className="h-2" />)
      } else {
        elements.push(
          <p key={`p-${i}`} className="mb-3 last:mb-0 leading-relaxed text-foreground/90">
            {formatInline(line)}
          </p>,
        )
      }
    }
  })
  flushList()
  return elements
}

export default function VallenIA() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    const role = user?.role || 'retailer'
    const isAdmin = role === 'admin' || user?.email === 'valterpmendonca@gmail.com'

    let greeting = ''
    if (isAdmin) {
      greeting =
        'Olá, Administrador! Sou a **VALLEN IA**. Como posso ajudar com relatórios estratégicos, análise do ecossistema ou sugestões de marketing hoje?'
    } else if (role === 'manufacturer') {
      greeting =
        'Olá! Sou a **VALLEN IA**, sua consultora. Pronta para ajudar com visual merchandising, criação de kits ou otimização de suas vendas no Guia VIP!'
    } else if (role === 'agent') {
      greeting =
        'Olá, Guia! Sou a **VALLEN IA**. Posso ajudar na otimização de rotas das caravanas e nas estratégias de vendas.'
    } else if (role === 'affiliate') {
      greeting =
        'Olá, Influenciador! Sou a **VALLEN IA**. Vamos criar roteiros de vendas incríveis para seus Stories e analisar sua performance!'
    } else {
      greeting =
        'Olá! Sou a **VALLEN IA**, sua assistente comercial. Como posso ajudar na curadoria de lotes ou comparar as opções do Guia VIP para você?'
    }

    setMessages([{ role: 'assistant', content: greeting }])
  }, [user])

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const newMessages = [...messages, { role: 'user' as const, content: input }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }))

      const res = await pb.send('/backend/v1/vallen-chat', {
        method: 'POST',
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (res.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }])
      }
    } catch (err: any) {
      toast.error('Erro ao conectar com VALLEN IA')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-10rem)] min-h-[400px] max-h-[900px] animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">VALLEN IA</h1>
          <p className="text-muted-foreground text-sm">
            Consultoria de Inteligência Comercial V MODA
          </p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-muted shadow-md">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6 pb-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex gap-4 max-w-[90%] md:max-w-[80%]',
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
                )}
              >
                <Avatar
                  className={cn(
                    'h-8 w-8 shrink-0 mt-1',
                    msg.role === 'assistant'
                      ? 'ring-2 ring-primary/20 ring-offset-2 ring-offset-background'
                      : '',
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>

                <div
                  className={cn(
                    'rounded-2xl px-5 py-4 text-sm shadow-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted/30 border border-border/50 rounded-tl-sm',
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div className="text-sm">{formatMarkdown(msg.content)}</div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 max-w-[80%] mr-auto animate-pulse">
                <Avatar className="h-8 w-8 shrink-0 mt-1 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl px-5 py-4 bg-muted/30 border border-border/50 rounded-tl-sm flex items-center gap-3 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground font-medium">
                    Analisando inteligência comercial...
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-background border-t shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-3 relative max-w-4xl mx-auto"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre comissões, estratégias ou catálogo..."
              className="flex-1 h-12 rounded-full pl-6 pr-14 shadow-sm bg-muted/20 border-muted focus-visible:ring-primary/50"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 h-9 w-9 rounded-full shadow-sm transition-transform active:scale-95"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </Button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground">
              A VALLEN IA processa as regras de negócio internamente e não recomenda transações
              externas.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
