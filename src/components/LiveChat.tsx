import { useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => {
      setIsOpen(false)
      setTimeout(() => setIsSubmitted(false), 300)
    }, 3000)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-background border border-border shadow-2xl w-[320px] rounded-lg overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
            <h3 className="font-medium">Suporte V Moda</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:opacity-70 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-6 h-6" />
                </div>
                <p className="font-medium text-green-600">Sua mensagem foi enviada com sucesso!</p>
                <p className="text-sm text-muted-foreground mt-2">Retornaremos em breve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chat-name">Nome</Label>
                  <Input id="chat-name" required placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chat-email">E-mail</Label>
                  <Input id="chat-email" type="email" required placeholder="seu@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chat-message">Mensagem</Label>
                  <Textarea
                    id="chat-message"
                    required
                    placeholder="Como podemos ajudar?"
                    className="resize-none min-h-[80px]"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Enviar
                </Button>
              </form>
            )}
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
