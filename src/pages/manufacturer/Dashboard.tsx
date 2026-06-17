import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { streamAgentChat, type DisplayMessage } from '@/lib/skipAi'
import { Send, Copy, TrendingUp, Users, ShoppingBag, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

const TEMPLATES = [
  {
    title: 'Template 1: Abordagem Inicial (Ranking)',
    content:
      'Olá! Sou representante da *[Sua Marca]*, uma das marcas TOP no ranking da *V MODA BRASIL*. Notei que você revende moda com foco em qualidade e acho que nossas coleções seriam um grande diferencial para a sua loja. Gostaria de receber nosso catálogo digital em formato revista?',
  },
  {
    title: 'Template 2: Promoção V Club Card',
    content:
      'Olá! Como nosso cliente VIP, você pode utilizar seu saldo de cashback do *V Club Card* nas suas próximas compras no atacado conosco. Aproveite essa vantagem exclusiva para aumentar sua margem de lucro. Vamos fazer um pedido hoje?',
  },
]

export default function ManufacturerDashboard() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá! Sou a Vallen, sua consultora de negócios atacadistas. Como posso ajudar a otimizar seu catálogo, definir mínimos de atacado ou usar o V Club Card para reter lojistas hoje?',
      created: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const currentInput = input
    setInput('')
    setIsLoading(true)

    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      created: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    abortControllerRef.current = new AbortController()

    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/ask-fabricante-stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: pb.authStore.token },
          body: JSON.stringify({ message: currentInput, conversation_id: conversationId }),
          signal: abortControllerRef.current.signal,
        },
      )

      const assistantMsgId = Date.now().toString() + '-ai'
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          created: new Date().toISOString(),
        },
      ])

      const result = await streamAgentChat(res, {
        onChunk: (_, full) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: full } : m)),
          )
        },
        signal: abortControllerRef.current.signal,
      })
      setConversationId(result.conversation_id)
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error('Falha ao consultar a Vallen', { description: err.message })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Template copiado com sucesso!')
  }

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-1">Painel do Fabricante</h1>
        <p className="text-muted-foreground">Gestão, Inteligência e Marketing em um só lugar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projetos Ativos</p>
              <p className="text-2xl font-bold">Catálogo Digital</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes VIPs</p>
              <p className="text-2xl font-bold">V Club Card</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consultoria (OODA)</p>
              <p className="text-2xl font-bold">Vallen IA</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vallen AI */}
        <Card className="flex flex-col h-[600px] border-primary/20 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Vallen - Consultoria Estratégica
            </CardTitle>
            <CardDescription>Otimização de Catálogo, Método ADA/OODA e Conversão</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted max-w-[85%] rounded-2xl px-4 py-3 rounded-tl-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
                          style={{ animationDelay: '0.4s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 bg-background border-t">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Peça dicas sobre preços, V Club ou catálogo..."
                  className="min-h-[44px] max-h-32 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-11 w-11 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Templates */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-serif mb-2">Templates de Vendas</h2>
            <p className="text-muted-foreground mb-4">
              Mensagens prontas de alta conversão para abordar revendedores e atacadistas no
              WhatsApp.
            </p>
          </div>

          <div className="space-y-4">
            {TEMPLATES.map((t, idx) => (
              <Card key={idx} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{t.title}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(t.content)}>
                      <Copy className="w-4 h-4 mr-2" /> Copiar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md">
                    {t.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
