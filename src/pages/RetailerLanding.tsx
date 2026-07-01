import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Store, Truck, TrendingUp, Package, CheckCircle2, ArrowRight } from 'lucide-react'
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
import { createRetailerLead } from '@/services/retailer-leads'
import { useSEO } from '@/hooks/useSEO'

const FEATURES = [
  {
    icon: Package,
    title: 'Abastecimento Direto',
    desc: 'Compre direto das melhores marcas com preços de atacado.',
  },
  {
    icon: Truck,
    title: 'Logística Regional',
    desc: 'Filtre fornecedores por polo de moda e otimize o frete.',
  },
  {
    icon: TrendingUp,
    title: 'TOP 100 Marcas',
    desc: 'Acesso exclusivo ao ranking das marcas mais vendidas.',
  },
  {
    icon: Store,
    title: 'Gestão Centralizada',
    desc: 'Gerencie pedidos, reposição e catálogo em um só lugar.',
  },
]

const FASHION_HUBS = [
  { value: '44_goiania', label: '44 Goiânia' },
  { value: 'fama_goiania', label: 'Fama Goiânia' },
  { value: 'bras_sp', label: 'Brás SP' },
  { value: 'bom_retiro_sp', label: 'Bom Retiro SP' },
  { value: 'outros', label: 'Outros' },
]

export default function RetailerLanding() {
  useSEO({
    title: 'Central de Abastecimento | V MODA BRASIL',
    description: 'Cadastre sua loja e abasteça-se das melhores marcas do Brasil.',
  })

  const [searchParams] = useSearchParams()
  const utm = {
    source: searchParams.get('utm_source') || '',
    medium: searchParams.get('utm_medium') || '',
    campaign: searchParams.get('utm_campaign') || '',
  }

  const [form, setForm] = useState({
    store_name: '',
    contact_name: '',
    cnpj: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    fashion_hub: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createRetailerLead({
        ...form,
        utm_source: utm.source,
        utm_medium: utm.medium,
        utm_campaign: utm.campaign,
        status: 'pending',
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true)
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
          Recebemos o interesse de <strong>{form.store_name}</strong> em participar da Central de
          Abastecimento V MODA. Nossa equipe entrará em contato em até 48 horas.
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
              Central de Abastecimento
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-navy mb-4 leading-tight">
              Abasteça sua loja com as
              <br />
              <span className="text-primary">melhores marcas do Brasil</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Cadastre-se gratuitamente e tenha acesso a catálogos de atacado, preços exclusivos e
              logística otimizada por região.
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
                <h2 className="text-2xl font-serif font-bold text-navy mb-2">
                  Cadastrar minha Loja
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Preencha os dados e nossa equipe entrará em contato.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Nome da Loja *</Label>
                    <Input
                      id="storeName"
                      value={form.store_name}
                      onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                      required
                      placeholder="Ex: Loja Fashion Boutique"
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={form.cnpj}
                      onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                      required
                      placeholder="00.000.000/0000-00"
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Pessoa de Contato *</Label>
                    <Input
                      id="contactName"
                      value={form.contact_name}
                      onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                      required
                      placeholder="Seu nome"
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp *</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                        placeholder="(00) 00000-0000"
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="loja@email.com"
                        className="rounded-xl h-12"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        required
                        placeholder="Sua cidade"
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado (UF) *</Label>
                      <Input
                        id="state"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                        required
                        placeholder="SP"
                        maxLength={2}
                        className="rounded-xl h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Polo de Moda</Label>
                    <Select
                      value={form.fashion_hub}
                      onValueChange={(v) => setForm({ ...form, fashion_hub: v })}
                    >
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Selecione seu polo" />
                      </SelectTrigger>
                      <SelectContent>
                        {FASHION_HUBS.map((h) => (
                          <SelectItem key={h.value} value={h.value}>
                            {h.label}
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
                    {loading ? 'Enviando...' : 'Quero Participar'}
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
