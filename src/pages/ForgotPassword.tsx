import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import logoUrl from '@/assets/logo-v-moda-fb088.png'

const forgotSchema = z.object({
  email: z.string().email('E-mail inválido.'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const form = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(data: ForgotForm) {
    setIsLoading(true)

    try {
      await pb.collection('users').requestPasswordReset(data.email)
      toast({
        title: 'Sucesso',
        description: 'Um link de redefinição de senha foi enviado para o seu e-mail.',
      })
      navigate('/login', { replace: true })
    } catch (error: any) {
      form.setError('email', {
        type: 'manual',
        message: 'Não foi possível enviar o link. Verifique se o e-mail está cadastrado.',
      })
      toast({
        title: 'Erro',
        description: 'Verifique se o e-mail está correto e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-lg border border-primary/10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="mx-auto flex justify-center mb-6">
            <img src={logoUrl} alt="V Moda" className="h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Recuperar Senha</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Informe seu e-mail para receber um link de redefinição de senha.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="seu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Recuperar Senha'}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-8 pt-6 border-t border-muted-foreground/10">
          <p className="text-sm text-muted-foreground">
            Lembrou a senha?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
