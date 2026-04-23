import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import logoUrl from '@/assets/logo-v-moda-fb088.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      toast.error('Erro ao fazer login. Verifique suas credenciais.')
      setIsLoading(false)
      return
    }

    toast.success('Login realizado com sucesso!')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md animate-fade-in-up shadow-xl border-border/50">
        <CardHeader className="space-y-6 items-center text-center">
          <img src={logoUrl} alt="V Moda" className="h-14 object-contain" />
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Acesso ao Painel
            </CardTitle>
            <CardDescription className="text-sm">
              Insira suas credenciais para gerenciar seus negócios.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@vmoda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background"
                disabled={isLoading}
              />
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Autenticando...' : 'Entrar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
