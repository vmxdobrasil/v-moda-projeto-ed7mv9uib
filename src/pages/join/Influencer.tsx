import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function JoinInfluencer() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [instagram, setInstagram] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { toast } = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await pb.collection('users').create({
        name,
        email,
        password,
        passwordConfirm: password,
        role: 'affiliate',
        instagram,
      })

      const { error } = await signIn(email, password)

      if (error) {
        toast({ title: 'Erro ao fazer login', variant: 'destructive' })
      } else {
        toast({ title: 'Bem-vindo ao programa de Influenciadores!' })
        navigate('/dashboard')
      }
    } catch (err: any) {
      toast({
        title: 'Erro no cadastro',
        description: err.message || 'Verifique os dados.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Programa de Influenciadores</CardTitle>
          <CardDescription>Monetize sua influência recomendando nossas marcas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome / Artístico</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Perfil do Instagram (@)</Label>
              <Input
                id="instagram"
                placeholder="@seuperfil"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                required
              />
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Quero ser Influenciador'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Link to="/login" className="text-sm text-primary hover:underline">
            Já sou parceiro
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
