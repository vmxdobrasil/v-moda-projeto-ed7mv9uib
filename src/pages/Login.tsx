import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate, useLocation } from 'react-router-dom'
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
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import logoUrl from '@/assets/v_moda_brasil_horizontal_fiel-afff8.png'
import { LiveChat } from '@/components/LiveChat'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const from = location.state?.from?.pathname

  useEffect(() => {
    if (from === '/settings' || from?.includes('settings')) {
      toast({
        title: 'Autenticação Necessária',
        description: 'Por favor, faça login para acessar as configurações de conexão.',
      })
    }
  }, [from, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      toast({
        title: 'Login Error',
        description: 'Invalid credentials or account not found.',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    const user = pb.authStore.record
    if (from) {
      navigate(from, { replace: true })
    } else if (user?.email === 'valterpmendonca@gmail.com' || user?.role === 'admin') {
      navigate('/admin/clientes')
    } else if (user?.role === 'manufacturer') {
      navigate('/manufacturer/leads')
    } else {
      navigate('/customers')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md animate-fade-in-up border-border/50 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex items-center justify-center mb-10 px-4">
            <img
              src={logoUrl}
              alt="V Moda Brasil"
              className="w-full max-w-[320px] h-auto object-contain transition-all duration-300"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Login to V Moda</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <LiveChat />
    </div>
  )
}
