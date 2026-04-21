import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { FadeIn } from '@/components/FadeIn'
import { MapPin, Phone, Mail } from 'lucide-react'

const schema = z.object({
  name: z.string().min(3, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone é obrigatório'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
})

type FormValues = z.infer<typeof schema>

export default function Contact() {
  const [loading, setLoading] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', message: '' },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      await pb.collection('customers').create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        notes: `Contato via formulário do site: ${data.message}`,
        source: 'site',
        status: 'new',
      })
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.')
      form.reset()
    } catch (e) {
      toast.error('Erro ao enviar mensagem. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-32 pb-24 container max-w-5xl min-h-screen">
      <FadeIn>
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Contato</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fale conosco. Estamos aqui para ajudar e responder todas as suas dúvidas.
          </p>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
        <FadeIn delay={100}>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-serif mb-6 border-b pb-2">Informações de Contato</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Endereço</p>
                    <p className="text-sm text-muted-foreground">Polo de Moda, Goiânia - GO</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Telefone</p>
                    <p className="text-sm text-muted-foreground">+55 (62) 9999-9999</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">contato@revistamodaatual.com.br</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="bg-secondary/20 p-8 rounded-xl border shadow-sm">
            <h3 className="text-2xl font-serif mb-6">Envie uma Mensagem</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone / WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Como podemos ajudar?"
                          className="h-32 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-12 uppercase tracking-widest mt-2"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>
              </form>
            </Form>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
