import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ShoppingBag,
  Users,
  Truck,
  TrendingUp,
  ArrowRight,
  Play,
  Star,
  ShieldCheck,
} from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import pb from '@/lib/pocketbase/client'

export default function Index() {
  const user = useAuthStore((state: any) => state.user)
  const navigate = useNavigate()
  const [stats, setStats] = useState({ brands: 0, products: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [brandsRes, productsRes] = await Promise.all([
          pb.collection('users').getList(1, 1, { filter: 'role="manufacturer"' }),
          pb.collection('projects').getList(1, 1),
        ])
        setStats({
          brands: brandsRes.totalItems || 150,
          products: productsRes.totalItems || 3000,
        })
      } catch (err) {
        console.error('Failed to fetch stats', err)
        setStats({ brands: 150, products: 3000 })
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-48 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 opacity-10 bg-[url('https://img.usecurling.com/p/1920/1080?q=fashion%20store')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent" />

        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground">
                  Lançamento V Moda
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-slate-900">
                  O Futuro do <span className="text-primary">Atacado de Moda</span>
                </h1>
                <p className="max-w-[600px] text-slate-600 md:text-xl leading-relaxed">
                  Conecte-se com os melhores fabricantes, gerencie suas compras, logística e aumente
                  suas vendas. O ecossistema completo para o lojista e atacadista de moda.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg"
                    onClick={() => navigate('/dashboard')}
                  >
                    Acessar Meu Painel <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="h-14 px-8 text-lg"
                      onClick={() => navigate('/cadastro')}
                    >
                      Criar Conta Grátis
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 px-8 text-lg bg-background"
                      onClick={() => navigate('/sobre-nos')}
                    >
                      <Play className="mr-2 h-5 w-5" /> Conheça a Plataforma
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-6 pt-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <span>Compra 100% Segura</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Marcas Verificadas</span>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-3xl transform rotate-3 scale-105" />
              <img
                src="https://img.usecurling.com/p/800/800?q=fashion%20models"
                alt="Fashion Hub"
                className="relative rounded-3xl object-cover shadow-2xl w-full aspect-square"
              />

              <Card className="absolute -bottom-6 -left-6 w-64 shadow-xl border-none">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{stats.brands}+</p>
                      <p className="text-sm text-slate-500">Marcas Ativas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute -top-6 -right-6 w-64 shadow-xl border-none">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <ShoppingBag className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{stats.products}+</p>
                      <p className="text-sm text-slate-500">Produtos no Catálogo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 md:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Tudo o que você precisa para crescer
            </h2>
            <p className="text-slate-600 md:text-lg">
              A V Moda oferece um conjunto completo de ferramentas para digitalizar, organizar e
              escalar o seu negócio de moda.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-none shadow-lg bg-slate-50 transition-transform hover:-translate-y-1">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">CRM & WhatsApp</CardTitle>
                <CardDescription className="text-base mt-2">
                  Gerencie todos os seus contatos, automatize mensagens de boas-vindas e nunca mais
                  perca uma venda no WhatsApp.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg bg-slate-50 transition-transform hover:-translate-y-1">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Catálogo Digital B2B</CardTitle>
                <CardDescription className="text-base mt-2">
                  Exiba seus produtos com fotos profissionais, grades de tamanhos e preços dinâmicos
                  para atacado e varejo.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg bg-slate-50 transition-transform hover:-translate-y-1">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Logística Inteligente</CardTitle>
                <CardDescription className="text-base mt-2">
                  Integração com excursões, acompanhamento de assentos e rastreamento de envios para
                  lojistas de todo o Brasil.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg bg-slate-50 transition-transform hover:-translate-y-1">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Rede de Afiliados</CardTitle>
                <CardDescription className="text-base mt-2">
                  Programa completo para guias de moda e representantes. Acompanhe comissões e
                  indicações em tempo real.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Pronto para transformar suas vendas?
            </h2>
            <p className="text-primary-foreground/80 md:text-xl max-w-[600px]">
              Junte-se a milhares de marcas e lojistas que já estão faturando mais com a plataforma
              V Moda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-8 text-lg"
                onClick={() => navigate('/cadastro')}
              >
                Criar Conta Grátis
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                onClick={() => navigate('/contato')}
              >
                Falar com Consultor
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
