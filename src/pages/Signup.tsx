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

const MANUFACTURER_CATEGORIES = [
  { value: 'moda_feminina', label: 'Feminina' },
  { value: 'jeans', label: 'Jeans' },
  { value: 'moda_praia', label: 'Praia' },
  { value: 'moda_fitness', label: 'Fitness' },
  { value: 'moda_masculina', label: 'Masculina' },
  { value: 'plus_size', label: 'Plus Size' },
  { value: 'moda_evangelica', label: 'Evangélica' },
  { value: 'moda_country', label: 'Country' },
  { value: 'moda_infantil', label: 'Infantil' },
  { value: 'bijouterias_semijoias', label: 'Acessórios' },
  { value: 'calcados', label: 'Calçados' },
]

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState<'varejo' | 'atacado' | 'fabricante'>('varejo')
  const [segmentTier, setSegmentTier] = useState('fashion_consultant')
  const [brandName, setBrandName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [rankingCategory, setRankingCategory] = useState('')
  const [walletId, setWalletId] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { toast } = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const isManufacturer = accountType === 'fabricante'
      const userData: Record<string, unknown> = {
        name,
        email,
        password,
        passwordConfirm: password,
        role: isManufacturer ? 'manufacturer' : 'retailer',
        segment_tier:
          accountType === 'varejo' ? 'retail' : accountType === 'atacado' ? segmentTier : undefined,
      }
      if (isManufacturer) {
        userData.brand_name = brandName
        userData.tax_id = taxId
        userData.wallet_id = walletId
      }
      await pb.collection('users').create(userData)
      await signIn(email, password)

      if (isManufacturer && pb.authStore.record) {
        let isWaitlisted = false
        try {
          const cat = await pb
            .collection('categories')
            .getFirstListItem(`slug = "${rankingCategory}"`)
          const limit = (cat as any).ranking_limit || 0
          if (limit > 0) {
            const existing = await pb.collection('customers').getList(1, 1, {
              filter: `ranking_category = "${rankingCategory}" && ranking_position > 0`,
            })
            isWaitlisted = existing.totalItems >= limit
          }
        } catch {
          /* intentionally ignored */
        }

        await pb.collection('customers').create({
          name: brandName || name,
          manufacturer: pb.authStore.record.id,
          ranking_category: rankingCategory,
          status: 'new',
          source: 'site',
        })

        if (isWaitlisted) {
          await pb.collection('users').update(pb.authStore.record.id, { is_waitlisted: true })
          toast({
            title: 'Conta criada na lista de espera',
            description: 'A categoria selecionada atingiu o limite TOP.',
          })
        } else {
          toast({ title: 'Conta criada com sucesso!' })
        }
        navigate('/manufacturer')
      } else {
        toast({ title: 'Conta criada com sucesso!' })
        navigate('/onboarding')
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
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Criar uma Conta</CardTitle>
          <CardDescription>Preencha os dados abaixo para se cadastrar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo / Razão Social</Label>
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
                onValueChange={(v: 'varejo' | 'atacado' | 'fabricante') => setAccountType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="varejo">Varejo (Consumo Próprio)</SelectItem>
                  <SelectItem value="atacado">Atacado (Revenda)</SelectItem>
                  <SelectItem value="fabricante">Fabricante (Fornecedor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {accountType === 'atacado' && (
              <div className="space-y-2 animate-fade-in-up">
                <Label>Nível de Revenda</Label>
                <Select value={segmentTier} onValueChange={setSegmentTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion_consultant">Consultora Fashion</SelectItem>
                    <SelectItem value="exclusive_consultant">Consultora Exclusive</SelectItem>
                    <SelectItem value="premium_consultant">Consultora Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {accountType === 'fabricante' && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="space-y-2">
                  <Label>Nome da Marca</Label>
                  <Input
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Ex: V Moda Brasil"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria Principal</Label>
                  <Select value={rankingCategory} onValueChange={setRankingCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MANUFACTURER_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Wallet ID (Asaas)</Label>
                  <Input
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    placeholder="ID da carteira Asaas"
                  />
                </div>
              </div>
            )}
            <Button
              type="submit"
              className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 text-white"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Fazer login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
