import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { getStoredUTM } from '@/lib/affiliate-tracking'
import pb from '@/lib/pocketbase/client'
import { TrendingUp, DollarSign, Share2, Award } from 'lucide-react'

const NICHES = [
  { value: 'moda_feminina', label: 'Moda Feminina' },
  { value: 'jeans', label: 'Jeans' },
  { value: 'moda_praia', label: 'Moda Praia' },
  { value: 'moda_masculina', label: 'Moda Masculina' },
  { value: 'moda_fitness', label: 'Moda Fitness' },
  { value: 'plus_size', label: 'Plus Size' },
  { value: 'moda_infantil', label: 'Moda Infantil' },
  { value: 'bijouterias_semijoias', label: 'Bijouterias/Semijoias' },
  { value: 'calcados', label: 'Calçados' },
  { value: 'moda_geral', label: 'Moda Geral' },
]

const TIERS = [
  {
    icon: Share2,
    title: 'Influenciador',
    rate: '1%',
    desc: 'Comissão sobre vendas via seus links',
  },
  {
    icon: TrendingUp,
    title: 'Guia de Compras',
    rate: '2%',
    desc: 'Comissão elevada por indicações qualificadas',
  },
  {
    icon: Award,
    title: 'Top Parceiro',
    rate: 'Custom',
    desc: 'Taxas exclusivas para altos performers',
  },
]

export default function JoinInfluencer() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [instagram, setInstagram] = useState('')
  const [taxId, setTaxId] = useState('')
  const [phone, setPhone] = useState('')
  const [niche, setNiche] = useState('')
  const [socialLinks, setSocialLinks] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const utm = getStoredUTM()
      const linksArray = socialLinks
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

      await pb.collection('users').create({
        name,
        email,
        password,
        passwordConfirm: password,
        role: 'affiliate',
        instagram,
        instagram_handle: instagram,
        tax_id: taxId,
        phone,
        niche,
        social_links: { platforms: linksArray, utm },
        approval_status: 'pending',
      })

      const { error } = await signIn(email, password)
      if (error) {
        toast({ title: 'Conta criada! Faça login para continuar.' })
        navigate('/login')
      } else {
        toast({ title: 'Cadastro realizado! Aguarde aprovação do admin.' })
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
    <div className="min-h-screen bg-gradient-to-b from-navy/5 to-background">
      <div className="container max-w-5xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-navy">Programa de Influenciadores</h1>
          <p className="text-muted-foreground mt-2">
            Monetize sua influência recomendando marcas da V MODA BRASIL
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {TIERS.map((tier) => (
            <Card key={tier.title} className="text-center">
              <CardContent className="pt-6">
                <tier.icon className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="font-bold text-navy">{tier.title}</h3>
                <div className="text-2xl font-bold text-electric my-1">{tier.rate}</div>
                <p className="text-xs text-muted-foreground">{tier.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Inscreva-se</CardTitle>
            <CardDescription>Preencha seus dados para participar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Nome / Artístico</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram (@)</Label>
                <Input
                  id="instagram"
                  placeholder="@seuperfil"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="taxId">CPF/CNPJ</Label>
                  <Input
                    id="taxId"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="niche">Nicho</Label>
                <Select value={niche} onValueChange={setNiche}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((n) => (
                      <SelectItem key={n.value} value={n.value}>
                        {n.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="socialLinks">Outras Redes Sociais (uma por linha)</Label>
                <Textarea
                  id="socialLinks"
                  placeholder="https://tiktok.com/@user&#10;https://youtube.com/@user"
                  value={socialLinks}
                  onChange={(e) => setSocialLinks(e.target.value)}
                  rows={2}
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
              <Button
                type="submit"
                className="w-full bg-electric hover:bg-electric/90 text-electric-foreground"
                disabled={loading}
              >
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
    </div>
  )
}
