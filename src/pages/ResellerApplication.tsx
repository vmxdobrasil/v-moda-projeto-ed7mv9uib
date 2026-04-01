import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useSEO } from '@/hooks/useSEO'
import { Store, CheckCircle2 } from 'lucide-react'

export default function ResellerApplication() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useSEO({
    title: 'Seja uma Revendedora',
    description:
      'Cadastre-se para se tornar uma revendedora V Moda e ter acesso a preços exclusivos de atacado.',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      toast({
        title: 'Solicitação enviada',
        description: 'Sua solicitação de revenda foi recebida e será analisada em breve.',
      })
    }, 1500)
  }

  return (
    <div className="container py-24 md:py-32 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <Store className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-serif">Seja uma Revendedora</h1>
          <p className="text-muted-foreground mt-2">
            Junte-se ao nosso grupo exclusivo e tenha acesso a preços de atacado.
          </p>
        </div>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-lg flex flex-col items-center text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500" />
          <h2 className="text-2xl font-serif text-emerald-900">Solicitação Recebida!</h2>
          <p className="text-emerald-700 max-w-md">
            Agradecemos o seu interesse em revender V Moda. Nossa equipe analisará seus dados e
            entrará em contato por e-mail em até 48 horas.
          </p>
        </div>
      ) : (
        <div className="bg-card p-6 md:p-8 rounded-lg border shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input id="fullName" required placeholder="Seu nome completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail Profissional</Label>
                <Input id="email" type="email" required placeholder="contato@sualoja.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input id="phone" required placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeName">Nome da Loja/Negócio</Label>
                <Input id="storeName" required placeholder="Ex: Boutique V Moda" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ (Opcional)</Label>
              <Input id="cnpj" placeholder="00.000.000/0000-00" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição da Atuação</Label>
              <Textarea
                id="description"
                required
                placeholder="Conte-nos um pouco sobre como você atua (loja física, online, sacoleira, etc.) e qual o seu público."
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram da Loja (Opcional)</Label>
              <Input id="instagram" placeholder="@sua.loja" />
            </div>

            <Button
              type="submit"
              className="w-full h-12 uppercase tracking-widest text-sm rounded-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
