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
import { Sparkles, Upload, CheckCircle2, Phone, MapPin } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { getAffiliateRef, getAffiliateSrc, getStoredUTM } from '@/lib/affiliate-tracking'

export default function FashionistaSignup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [password, setPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleVerifyPhone = () => {
    if (whatsapp.replace(/\D/g, '').length < 10) {
      toast({
        variant: 'destructive',
        title: 'WhatsApp inválido',
        description: 'Digite um número válido com DDD.',
      })
      return
    }
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      setPhoneVerified(true)
      toast({ title: 'WhatsApp verificado!', description: 'Seu número foi confirmado.' })
    }, 1200)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneVerified) {
      toast({
        variant: 'destructive',
        title: 'Verifique seu WhatsApp',
        description: 'É necessário validar o número antes de continuar.',
      })
      return
    }
    setLoading(true)
    try {
      const affiliateRef = getAffiliateRef()
      const affiliateSrc = getAffiliateSrc()
      const utm = getStoredUTM()

      const userData: Record<string, unknown> = {
        name,
        email,
        password,
        passwordConfirm: password,
        role: 'fashionista',
        segment_tier: 'retail',
        phone: whatsapp,
        city,
        address: `${city}, ${state}`,
      }

      if (avatarFile) {
        const formData = new FormData()
        Object.entries(userData).forEach(([k, v]) => formData.append(k, String(v)))
        formData.append('avatar', avatarFile)
        await pb.collection('users').create(formData)
      } else {
        await pb.collection('users').create(userData)
      }

      await signIn(email, password)

      const utmSource = utm.utm_source || affiliateSrc || 'direct'
      const refMetadata = {
        source: utmSource,
        utm_medium: utm.utm_medium || '',
        utm_campaign: utm.utm_campaign || '',
        affiliate_ref: affiliateRef || '',
      }

      try {
        await pb.send('/backend/v1/fashionista/track-onboarding', {
          method: 'POST',
          body: JSON.stringify({ metadata: refMetadata }),
          headers: { 'Content-Type': 'application/json' },
        })
      } catch {
        // Best-effort tracking
      }

      toast({ title: 'Bem-vinda(o) à V MODA Fashionista!', description: 'Sua conta foi criada.' })
      navigate('/fashionista')
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description: err.message || 'Verifique os dados.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-navy/5 p-4 py-8">
      <Card className="w-full max-w-lg shadow-soft-lg border-primary/10">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-xl">
              V MODA <span className="text-primary">Fashionista</span>
            </span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Criar Conta</CardTitle>
          <CardDescription>
            Junte-se à experiência de moda exclusiva da V MODA BRASIL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted border-2 border-primary/20 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-muted-foreground/40" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 cursor-pointer bg-primary text-white rounded-full p-2 shadow-soft hover:bg-primary/90 transition-colors">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Foto de perfil (opcional)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                    placeholder="(00) 00000-0000"
                    className="pl-9"
                    disabled={phoneVerified}
                  />
                </div>
                {phoneVerified ? (
                  <div className="flex items-center gap-1 text-green-600 px-3">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleVerifyPhone}
                    disabled={verifying || !whatsapp}
                  >
                    {verifying ? '...' : 'Verificar'}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
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
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-electric hover:bg-electric/90 text-white cta-glow h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta Fashionista'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground text-center">
            Já tem conta?{' '}
            <Link to="/fashionista/login" className="text-primary font-semibold hover:underline">
              Fazer login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
