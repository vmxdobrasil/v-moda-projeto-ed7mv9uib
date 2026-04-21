import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const schema = z.object({
  name: z.string().min(3, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  category: z.string().min(1, 'Categoria de interesse é obrigatória'),
})

type FormValues = z.infer<typeof schema>

export default function ResellerApplication() {
  const [loading, setLoading] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', city: '', state: '', category: '' },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      await pb.collection('customers').create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        state: data.state,
        ranking_category: data.category,
        notes: `Candidatura a revendedora pelo site.`,
        source: 'site',
        status: 'new',
      })
      toast.success('Inscrição enviada com sucesso! Entraremos em contato.')
      form.reset()
    } catch (e) {
      toast.error('Erro ao enviar inscrição. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-32 pb-24 container max-w-4xl min-h-screen">
      <FadeIn>
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Seja uma Revendedora</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Aumente seus lucros revendendo as melhores marcas do Polo de Moda. Preencha o formulário
            e faça parte do nosso ecossistema.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="bg-card p-8 rounded-xl border shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo ou Razão Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segmento de Interesse</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um segmento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="moda_feminina">Moda Feminina</SelectItem>
                          <SelectItem value="jeans">Jeans</SelectItem>
                          <SelectItem value="moda_praia">Moda Praia</SelectItem>
                          <SelectItem value="moda_masculina">Moda Masculina</SelectItem>
                          <SelectItem value="moda_fitness">Moda Fitness</SelectItem>
                          <SelectItem value="calcados">Calçados</SelectItem>
                          <SelectItem value="bijouterias_semijoias">Acessórios</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Sua cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado (UF)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: SP" maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 uppercase tracking-widest mt-4"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Quero ser Revendedora'}
              </Button>
            </form>
          </Form>
        </div>
      </FadeIn>
    </div>
  )
}
