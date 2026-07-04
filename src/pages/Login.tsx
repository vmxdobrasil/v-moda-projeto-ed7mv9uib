import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import logoUrl from '@/assets/v_moda_brasil_horizontal_fiel-afff8.png'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { getRoleBasedRedirect } from '@/lib/auth-redirects'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { signIn, authError, clearAuthError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        const err = error as any
        const msg = getErrorMessage(error)

        if (err?.status === 0) {
          setErrorMessage('Erro de rede. Verifique sua conexão com a internet e tente novamente.')
        } else if (err?.status === 400) {
          setErrorMessage('Credenciais inválidas. Verifique seu e-mail e senha.')
        } else if (err?.status === 401 || err?.status === 403) {
          if (msg.toLowerCase().includes('verif')) {
            setErrorMessage('Conta não verificada. Verifique seu e-mail para ativar sua conta.')
          } else {
            setErrorMessage('E-mail ou senha incorretos. Tente novamente.')
          }
        } else if (msg.toLowerCase().includes('verif')) {
          setErrorMessage('Conta não verificada. Verifique seu e-mail para ativar sua conta.')
        } else {
          setErrorMessage(msg || 'Ocorreu um erro ao tentar fazer login.')
        }
      } else {
        const record = pb.authStore.record as any
        navigate(getRoleBasedRedirect(record))
      }
    } catch (err: any) {
      const msg = getErrorMessage(err)
      setErrorMessage(msg || 'Ocorreu um erro inesperado ao tentar fazer login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy/5 via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img src={logoUrl} alt="V MODA Brasil" className="h-[4.8rem] w-auto object-contain" />
          </Link>
        </div>

        <Card className="shadow-soft-lg border-primary/10">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight font-display text-navy dark:text-white">
              Bem-vindo(a) à V MODA
            </CardTitle>
            <CardDescription>Entre com suas credenciais para acessar a plataforma</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {(errorMessage || authError) && (
                <Alert variant="destructive" className="rounded-2xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage || authError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={clearAuthError}
                  required
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={clearAuthError}
                  required
                  className="rounded-2xl"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                className="w-full rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground cta-glow font-semibold"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
              <div className="text-sm text-muted-foreground text-center">
                Não tem conta?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Cadastre-se
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
