import { useState } from 'react'
import { Link } from 'react-router-dom'
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

const forgotSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const { toast } = useToast()

  const form = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: '',
    },
  })

  function onSubmit(_data: ForgotForm) {
    setIsLoading(true)

    setTimeout(() => {
      toast({
        title: 'E-mail enviado',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      })

      setIsLoading(false)
      setIsSent(true)
    }, 1000)
  }

  return (
    <div className="container max-w-md mx-auto py-24 md:py-32">
      <div className="flex flex-col space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-serif">Recuperar Senha</h1>
          <p className="text-muted-foreground mt-2">
            {isSent
              ? 'Enviamos as instruções de recuperação para seu e-mail.'
              : 'Informe seu e-mail para receber um link de redefinição de senha.'}
          </p>
        </div>

        {!isSent ? (
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

              <Button
                type="submit"
                className="w-full rounded-none h-12 uppercase tracking-widest mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
              </Button>
            </form>
          </Form>
        ) : (
          <Button
            asChild
            variant="outline"
            className="w-full rounded-none h-12 uppercase tracking-widest mt-6"
          >
            <Link to="/login">Voltar para o Login</Link>
          </Button>
        )}

        <div className="text-center mt-6">
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
