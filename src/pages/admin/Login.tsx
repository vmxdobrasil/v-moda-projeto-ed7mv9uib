import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import logoUrl from '@/assets/v_moda_brasil_horizontal_fiel-afff8.png'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Por favor, preencha o e-mail e a senha.')
      return
    }

    setLoading(true)
    try {
      await pb.collection('users').authWithPassword(email, password)
      localStorage.setItem('admin_auth', '1')

      const isAdmin =
        pb.authStore.record?.email === 'valterpmendonca@gmail.com' ||
        pb.authStore.record?.role === 'manufacturer' ||
        pb.authStore.record?.role === 'admin'

      toast.success('Login bem-sucedido. Bem-vindo ao painel.')

      const from = location.state?.from?.pathname
      if (from && !['/login', '/admin/login', '/cadastro', '/'].includes(from)) {
        navigate(from, { replace: true })
      } else {
        navigate(isAdmin ? '/dashboard/crm' : '/admin', { replace: true })
      }
    } catch (err: any) {
      pb.authStore.clear()

      const fieldErrors = err.response?.data || {}
      if (typeof fieldErrors === 'object' && Object.keys(fieldErrors).length > 0) {
        const msgs = Object.values(fieldErrors)
          .map((v: any) => v?.message)
          .filter(Boolean)
        if (msgs.length > 0) {
          toast.error(`Erro: ${msgs.join(' ')}`)
          setLoading(false)
          return
        }
      }

      let msg = 'Credenciais inválidas.'
      if (err.status === 400) {
        msg = 'Dados inválidos ou credenciais incorretas.'
      } else if (err.status === 403 || err.status === 401) {
        msg = 'Permissão negada ou credenciais incorretas.'
      } else if (err.status === 0) {
        msg = 'Erro de rede. Verifique sua conexão com a internet.'
      } else if (err.message) {
        msg = err.message
      }

      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-6">
            <img src={logoUrl} alt="V Moda Brasil" className="h-12 w-auto object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Acesso Restrito</CardTitle>
          <CardDescription>
            Insira suas credenciais para acessar o painel administrativo da V Moda.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@vmoda.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
