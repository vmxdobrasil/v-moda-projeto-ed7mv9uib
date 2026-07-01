import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Store, TrendingUp, Users, Package, CheckCircle2, ArrowRight } from 'lucide-react'
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
import { Card, CardContent } from '@/components/ui/card'
import { FadeIn } from '@/components/FadeIn'
import { createLeadFabricante } from '@/services/leads-fabricantes'
import { trackCampaignClick } from '@/services/campanhas-marketing'
import { useSEO } from '@/hooks/useSEO'

const CATEGORIES = [
  { value: 'moda_feminina', label: 'Moda Feminina' },
  { value: 'jeans', label: 'Jeans' },
  { value: 'moda_praia', label: 'Moda Praia' },
  { value: 'moda_masculina', label: 'Moda Masculina' },
  { value: 'moda_fitness', label: 'Moda Fitness' },
  { value: 'plus_size', label: 'Plus Size' },
  { value: 'moda_evangelica', label: 'Moda Evangélica' },
  { value: 'bijouterias_semijoias', label: 'Acessórios' },
]

const FEATURES = [
  {
    icon: Package,
    title: 'Catálogo Digital',
    desc: 'Gerencie seus produtos com fotos, grade de tamanhos e preços de atacado.',
  },
  {
    icon: Store,
    title: 'Múltiplas Unidades',
    desc: 'Cadastre lojas de fábrica e filiais com equipes de vendas dedicadas.',
  },
  {
    icon: TrendingUp,
    title: 'Visibilidade TOP',
    desc: 'Apareça no Guia de Compras visto por milhares de lojistas B2B.',
  },
  {
    icon: Users,
    title: 'Equipe de Vendas',
    desc: 'Gerencie gerentes e vendedoras vinculados a cada unidade.',
  },
]

export default function LojasFabricantes() {
  useSEO({
    title: 'Seja um Fabricante Parceiro | V MODA BRASIL',
    description: 'Cadastre sua marca no ecossistema V MODA BRASIL e alcance milhares de lojistas.',
  })

  const [searchParams] = useSearchParams()
  const utmSource = searchParams.get('utm_source') || ''
  const utmMedium = searchParams.get('utm_medium') || ''
  const utmCampaign = searchParams.get('utm_campaign') || ''

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (utmSource) await trackCampaignClick(utmSource)
      await createLeadFabricante({
        name,
        category,
        whatsapp,
        email,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        status: 'pending',
      })
      setSubmitted(true)
    } catch {
      // Silently fail — user sees error state
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="pt-32 pb-24 container max-w-2xl text-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-electric/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-electric" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-navy mb-4">
          Cadastro Recebido!
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Recebemos o interesse de <strong>{name}</strong> em participar do V MODA BRASIL. Nossa
          equipe entrará em contato pelo WhatsApp em até 48 horas.
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
            <Link to="/">Voltar ao Início</Link>
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
            <span className="inline-block bg-electric/10 text-electric text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Programa de Fabricantes
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-navy mb-4 leading-tight">
              Junte-se ao ecossistema
              <br />
              <span className="text-primary">V MODA BRASIL</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Cadastre sua marca e alcance milhares de lojistas em todo o Brasil. Gerencie catálogo,
              unidades e equipe de vendas em uma só plataforma.
            </p>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <FadeIn delay={100}>
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-navy">Por que participar?</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {FEATURES.map((f) => (
                  <Card
                    key={f.title}
                    className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <f.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-navy mb-1">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <Card className="rounded-2xl shadow-xl border-border/50 sticky top-28">
              <CardContent className="p-8">
                <h2 className="text-2xl font-serif font-bold text-navy mb-2">Cadastre sua Marca</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Preencha os dados abaixo e nossa equipe entrará em contato.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brandName">Nome da Marca *</Label>
                    <Input
                      id="brandName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Ex: Bella Moda Atelier"
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria TOP *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Selecione sua categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp de Contato *</Label>
                    <Input
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      required
                      placeholder="(00) 00000-0000"
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@suaempresa.com"
                      className="rounded-xl h-12"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !name || !category || !whatsapp}
                    className="w-full bg-electric hover:bg-electric/90 text-white rounded-2xl h-14 text-base font-semibold uppercase tracking-wide"
                  >
                    {loading ? 'Enviando...' : 'Quero Participar'}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Ao se cadastrar, você concorda em receber contato da equipe V MODA BRASIL.
                  </p>
                </form>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
