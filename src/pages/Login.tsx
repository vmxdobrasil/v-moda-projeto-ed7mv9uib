import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import pb from '@/lib/pocketbase/client'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { login } = useAuthStore()

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginForm) {
    setIsLoading(true)

    try {
      const authData = await pb.collection('users').authWithPassword(data.email, data.password)
      login(authData.record as any)

      toast({
        title: 'Login realizado',
        description: 'Bem-vindo de volta à V Moda!',
      })

      const from = location.state?.from?.pathname
      if (from) {
        navigate(from, { replace: true })
      } else {
        const role = authData.record.role
        if (
          role === 'manufacturer' ||
          role === 'admin' ||
          data.email === 'valterpmendonca@gmail.com'
        ) {
          navigate('/dashboard/crm', { replace: true })
        } else {
          navigate('/perfil', { replace: true })
        }
      }
    } catch (err: any) {
      pb.authStore.clear()
      let description = 'E-mail ou senha incorretos. Tente novamente.'

      if (err.status === 400) {
        description = 'Dados inválidos ou credenciais incorretas.'
      } else if (err.status === 403 || err.status === 401) {
        description = 'Permissão negada ou credenciais incorretas.'
      } else if (err.status === 0) {
        description = 'Erro de rede. Verifique sua conexão com a internet.'
      } else if (err.message) {
        description = err.message
      }

      toast({
        title: 'Erro ao fazer login',
        description,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-24 md:py-32">
      <div className="flex flex-col space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-serif">Acesse sua conta</h1>
          <p className="text-muted-foreground mt-2">Insira seus dados para continuar.</p>
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Senha</FormLabel>
                    <Link to="/recuperar-senha" className="text-sm text-primary hover:underline">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
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
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Ainda não tem uma conta?{' '}
            <Link to="/cadastro" className="text-primary hover:underline font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
