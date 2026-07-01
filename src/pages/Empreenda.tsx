import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Crown,
  TrendingUp,
  ShoppingBag,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FadeIn } from '@/components/FadeIn'
import { createRevendedora } from '@/services/revendedoras'
import { useSEO } from '@/hooks/useSEO'

const BENEFITS = [
  {
    icon: ShoppingBag,
    title: 'Catálogo Exclusivo',
    desc: 'Acesso às TOP 100 marcas e fabricantes parceiros.',
  },
  {
    icon: TrendingUp,
    title: 'Lucro Real',
    desc: 'Preços de atacado e dropshipping com margens de 30-60%.',
  },
  {
    icon: Crown,
    title: 'Sistema de Pontos',
    desc: 'Acumule pontos e suba de nível: Bronze, Prata, Ouro e Diamante.',
  },
  { icon: Users, title: 'Minha Rede', desc: 'Indique amigas e ganhe comissões indiretas.' },
]

const REGIONS = [
  'Norte',
  'Nordeste',
  'Centro-Oeste',
  'Sudeste',
  'Sul',
  '44 Goiânia',
  'Fama Goiânia',
  'Brás SP',
  'Bom Retiro SP',
]

export default function Empreenda() {
  useSEO({
    title: 'Empreenda com a V MODA | Seja uma Revendedora',
    description: 'Comece seu negócio de moda com a V MODA BRASIL.',
  })

  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ name: '', cpf: '', whatsapp: '', region: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const source = searchParams.get('ref')
    ? 'mgm'
    : searchParams.get('utm_source') === 'ads'
      ? 'ads'
      : searchParams.get('utm_source') === 'whatsapp'
        ? 'whatsapp_group'
        : 'direct'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createRevendedora({
        ...form,
        source,
        status: 'pending',
        tier: 'bronze',
        total_points: 0,
        monthly_points: 0,
        total_sales: 0,
      })
      setDone(true)
    } catch {
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="pt-32 pb-24 container max-w-2xl text-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-electric/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-electric" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-navy mb-4">
          Bem-vinda à V MODA!
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Recebemos seu cadastro, <strong>{form.name}</strong>! Você já tem acesso ao catálogo
          digital das TOP 100 marcas. Nossa equipe entrará em contato em breve.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="bg-electric hover:bg-electric/90 text-white rounded-2xl h-12 px-8"
          >
            <Link to="/signup">
              Completar Cadastro <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-2xl h-12 px-8">
            <Link to="/colecoes">Ver Catálogo</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-24">
      <section className="container max-w-6xl">
        <FadeIn>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1 bg-electric/10 text-electric text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3 h-3" /> Revendedoras Autônomas
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-navy mb-4 leading-tight">
              Empreenda com a<br />
              <span className="text-primary">V MODA BRASIL</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Comece seu negócio de moda sem investimento inicial. Acesse marcas premium, ganhe com
              cada venda e cresça com nosso sistema de pontos.
            </p>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <FadeIn delay={100}>
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-navy">
                Por que ser Revendedora V MODA?
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {BENEFITS.map((b) => (
                  <Card
                    key={b.title}
                    className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <b.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-navy mb-1">{b.title}</h3>
                      <p className="text-sm text-muted-foreground">{b.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <Card className="rounded-2xl shadow-xl border-border/50 sticky top-28">
              <CardContent className="p-8">
                <h2 className="text-2xl font-serif font-bold text-navy mb-2">Cadastro Gratuito</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Preencha e comece a vender hoje mesmo.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emp-name">Nome Completo *</Label>
                    <Input
                      id="emp-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="Seu nome"
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-cpf">CPF *</Label>
                    <Input
                      id="emp-cpf"
                      value={form.cpf}
                      onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                      required
                      placeholder="000.000.000-00"
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-wpp">WhatsApp *</Label>
                    <Input
                      id="emp-wpp"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                      required
                      placeholder="(00) 00000-0000"
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Região de Atuação *</Label>
                    <Select
                      value={form.region}
                      onValueChange={(v) => setForm({ ...form, region: v })}
                    >
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Selecione sua região" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-electric hover:bg-electric/90 text-white rounded-2xl h-14 text-base font-semibold uppercase tracking-wide"
                  >
                    {loading ? 'Enviando...' : 'Quero Empreender'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
