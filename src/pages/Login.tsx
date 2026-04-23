import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import logoUrl from '@/assets/logo-v-moda-fb088.png'

const loginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
})

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, user } = useAuth()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    const { error } = await signIn(values.email, values.password)
    setIsLoading(false)

    if (error) {
      toast.error('Credenciais inválidas. Verifique seu e-mail e senha e tente novamente.')
    } else {
      toast.success('Login realizado com sucesso!')
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10 animate-fade-in-up">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto flex justify-center mb-4">
            <img src={logoUrl} alt="V Moda" className="h-16 object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Hub</CardTitle>
          <CardDescription>Acesse o painel para gerenciar seu catálogo e CRM.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" autoComplete="email" {...field} />
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
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4 mt-4 bg-muted/20">
          <p className="text-sm text-muted-foreground">Esqueceu a senha? Contate o administrador</p>
        </CardFooter>
      </Card>
    </div>
  )
}
