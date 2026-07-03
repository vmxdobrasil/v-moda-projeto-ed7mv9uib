import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
import { Sparkles, Mail, Lock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function FashionistaLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao entrar',
          description: 'Verifique suas credenciais e tente novamente.',
        })
      } else {
        toast({ title: 'Bem-vinda(o) de volta!' })
        navigate('/fashionista')
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro inesperado',
        description: 'Tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-navy/5 p-4">
      <Card className="w-full max-w-md shadow-soft-lg border-primary/10">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-xl">
              V MODA <span className="text-primary">Fashionista</span>
            </span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Entrar</CardTitle>
          <CardDescription>Acesse sua experiência de moda exclusiva</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-electric hover:bg-electric/90 text-white cta-glow"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Ainda não tem conta?{' '}
              <Link to="/fashionista/signup" className="text-primary font-semibold hover:underline">
                Criar conta Fashionista
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
