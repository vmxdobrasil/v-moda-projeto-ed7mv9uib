import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  name: z.string().min(3, 'Nome ou Razão Social é obrigatório'),
  document: z.string().min(11, 'CPF ou CNPJ inválido'),
  revenue: z.string().min(1, 'Faturamento mensal é obrigatório'),
  amount: z.string().min(1, 'Valor desejado é obrigatório'),
  purpose: z.string().min(1, 'Selecione um objetivo'),
  email: z.string().email('E-mail inválido'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
})

type FormValues = z.infer<typeof formSchema>

export function CreditoModaForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      document: '',
      revenue: '',
      amount: '',
      purpose: '',
      email: '',
      whatsapp: '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    // Simulating API call to store in Skip Cloud Collections
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log('Dados salvos na collection de Crédito:', data)
    setIsSubmitting(false)
    form.reset()
    toast({
      title: 'Solicitação Enviada!',
      description:
        'Sua análise de crédito foi recebida e nossa equipe entrará em contato em breve.',
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo ou Razão Social</FormLabel>
              <FormControl>
                <Input placeholder="Sua empresa ou seu nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF / CNPJ</FormLabel>
                <FormControl>
                  <Input placeholder="000.000.000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="revenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faturamento Mensal Estimado</FormLabel>
                <FormControl>
                  <Input placeholder="R$ 0,00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor de Crédito Desejado</FormLabel>
                <FormControl>
                  <Input placeholder="R$ 0,00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objetivo do Crédito</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um objetivo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="estoque">Compra de Estoque</SelectItem>
                    <SelectItem value="equipamentos">Equipamentos / Maquinário</SelectItem>
                    <SelectItem value="marketing">Marketing e Vendas</SelectItem>
                    <SelectItem value="capital">Capital de Giro</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail Corporativo/Pessoal</FormLabel>
                <FormControl>
                  <Input placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-full h-12 uppercase tracking-widest text-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando Solicitação...' : 'Solicitar CréditoModa'}
        </Button>
      </form>
    </Form>
  )
}
