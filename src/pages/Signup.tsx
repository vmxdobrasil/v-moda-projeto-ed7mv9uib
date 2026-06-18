import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState<'varejo' | 'atacado'>('varejo')
  const [segmentTier, setSegmentTier] = useState<string>('fashion_consultant')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { toast } = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const finalSegment = accountType === 'varejo' ? 'retail' : segmentTier

      await pb.collection('users').create({
        name,
        email,
        password,
        passwordConfirm: password,
        role: 'retailer',
        segment_tier: finalSegment,
      })

      const { error } = await signIn(email, password)

      if (error) {
        toast({ title: 'Erro ao fazer login após cadastro', variant: 'destructive' })
      } else {
        toast({ title: 'Conta criada com sucesso!' })
        navigate('/dashboard')
      }
    } catch (err: any) {
      toast({
        title: 'Erro no cadastro',
        description: err.message || 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Criar uma Conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para se cadastrar na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Conta</Label>
              <Select
                value={accountType}
                onValueChange={(val: 'varejo' | 'atacado') => setAccountType(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="varejo">Varejo (Consumo Próprio)</SelectItem>
                  <SelectItem value="atacado">Atacado (Revenda)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {accountType === 'atacado' && (
              <div className="space-y-2 animate-fade-in-up">
                <Label>Nível de Revenda</Label>
                <Select value={segmentTier} onValueChange={setSegmentTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion_consultant">Consultora Fashion</SelectItem>
                    <SelectItem value="exclusive_consultant">
                      Consultora Fashion Exclusive
                    </SelectItem>
                    <SelectItem value="premium_consultant">Consultora Fashion Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Fazer login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
