import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
  return (
    <div className="container max-w-md mx-auto py-24 md:py-32">
      <div className="flex flex-col space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-serif">Acesse sua conta</h1>
          <p className="text-muted-foreground mt-2">Insira seus dados para continuar.</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="seu@email.com" required />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Senha</Label>
              <Link to="#" className="text-sm text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <Input id="password" type="password" required />
          </div>

          <Button type="submit" className="w-full rounded-none h-12 uppercase tracking-widest mt-6">
            Entrar
          </Button>
        </form>

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
