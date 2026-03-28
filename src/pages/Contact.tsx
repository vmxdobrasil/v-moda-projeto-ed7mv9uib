import { useState } from 'react'
import { FadeIn } from '@/components/FadeIn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Mail, Phone, MapPin, Loader2 } from 'lucide-react'

export default function Contact() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'O nome completo é obrigatório.'
    if (!formData.email.trim()) {
      newErrors.email = 'O e-mail é obrigatório.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Insira um e-mail válido.'
    }
    if (!formData.subject.trim()) newErrors.subject = 'O assunto é obrigatório.'
    if (!formData.message.trim()) newErrors.message = 'A mensagem é obrigatória.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      // Simula uma chamada de API
      setTimeout(() => {
        setIsSubmitting(false)
        toast({
          title: 'Mensagem enviada com sucesso!',
          description: 'Entraremos em contato em breve.',
        })
        setFormData({ name: '', email: '', subject: '', message: '' })
        setErrors({})
      }, 1500)
    }
  }

  return (
    <div className="pt-32 pb-24">
      <div className="container max-w-6xl">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-serif text-center mb-6">Fale Conosco</h1>
          <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Estamos aqui para ajudar. Envie sua mensagem, tire suas dúvidas ou entre em contato
            diretamente pelos nossos canais oficiais.
          </p>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
          <FadeIn delay={100}>
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-serif mb-8">Informações de Contato</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Nosso time de atendimento está pronto para oferecer o suporte necessário. Sinta-se
                  à vontade para nos visitar em nosso ateliê ou utilizar os meios abaixo.
                </p>
              </div>

              <div className="flex items-start gap-5">
                <div className="bg-secondary/50 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Nosso Ateliê</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Av. Brigadeiro Faria Lima, 1234 - Conj 56
                    <br />
                    Jardim Paulistano, São Paulo - SP
                    <br />
                    01451-001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="bg-secondary/50 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Telefone / WhatsApp</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    +55 (11) 99999-9999
                    <br />
                    Seg - Sex, das 9h às 18h
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="bg-secondary/50 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">E-mail</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    contato@vmoda.com.br
                    <br />
                    suporte@vmoda.com.br
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <form
              onSubmit={handleSubmit}
              className="bg-secondary/20 p-8 sm:p-10 border border-border"
            >
              <h2 className="text-2xl font-serif mb-8">Envie uma Mensagem</h2>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nome Completo
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`h-12 bg-background ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    placeholder="Seu nome completo"
                  />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    E-mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`h-12 bg-background ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    placeholder="seu.email@exemplo.com"
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Assunto
                  </label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={`h-12 bg-background ${errors.subject ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    placeholder="Assunto da sua mensagem"
                  />
                  {errors.subject && (
                    <p className="text-xs text-destructive mt-1">{errors.subject}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Mensagem
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`min-h-[150px] bg-background resize-none ${errors.message ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    placeholder="Como podemos ajudar?"
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive mt-1">{errors.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full uppercase tracking-widest h-14 mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    'Enviar Mensagem'
                  )}
                </Button>
              </div>
            </form>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
