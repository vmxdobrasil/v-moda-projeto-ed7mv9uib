import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Users,
  Store,
  TrendingUp,
  Banknote,
  ArrowRightLeft,
  ShieldCheck,
  CreditCard,
  Rocket,
  Target,
  Layers,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export default function ZoopProposal() {
  const [totalBuyers, setTotalBuyers] = useState(31046)
  const [totalStores, setTotalStores] = useState(1000)

  const [conversionRate, setConversionRate] = useState([15])
  const [avgTicket, setAvgTicket] = useState<string>('850')
  const [takeRate, setTakeRate] = useState([2.5])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customersReq = await pb.collection('customers').getList(1, 1)
        if (customersReq.totalItems > 31046) setTotalBuyers(customersReq.totalItems)
        const storesReq = await pb
          .collection('users')
          .getList(1, 1, { filter: "role='manufacturer'" })
        if (storesReq.totalItems > 1000) setTotalStores(storesReq.totalItems)
      } catch (e) {
        /* silent fail, use fallbacks */
      }
    }
    fetchData()
  }, [])

  const ticketValue = parseFloat(avgTicket) || 0
  const convertedUsers = Math.floor(totalBuyers * (conversionRate[0] / 100))
  const monthlyTpv = convertedUsers * ticketValue
  const platformRevenue = monthlyTpv * (takeRate[0] / 100)

  const chartData = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const growth = Math.pow(1.05, i) // 5% compounded monthly growth
      const currentTpv = monthlyTpv * growth
      return {
        month: `Mês ${i + 1}`,
        tpv: currentTpv,
        revenue: currentTpv * (takeRate[0] / 100),
      }
    })
  }, [monthlyTpv, takeRate])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Zoop Partnership Hub</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          V MODA + Zoop: Hub 360º de Infraestrutura Financeira para o Polo de Moda de Goiânia
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="simulator">Simulador TPV</TabsTrigger>
          <TabsTrigger value="finance">Embedded Finance</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap Estratégico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compradores Ativos</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBuyers.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Base qualificada pronta para transacionar
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lojistas no Guia</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStores.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Fabricantes integrados ao ecossistema
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Marcas Âncora</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Top 60</div>
                <p className="text-xs text-muted-foreground mt-1">
                  As maiores marcas tracionando o GMV
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alcance Social</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">313k</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Seguidores (Revista Moda Atual Digital)
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>A Tese de Valor V MODA + Zoop</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                O <strong>Polo de Moda de Goiânia</strong> movimenta bilhões anualmente, porém sofre
                com alta informalidade e ineficiência em pagamentos (especialmente B2B e vendas para
                sacoleiras).
              </p>
              <p>
                Ao integrar a <strong>Financial Infrastructure</strong> da Zoop, o V MODA deixa de
                ser apenas uma vitrine e torna-se um <strong>Hub 360º</strong>. Nós originamos a
                demanda (marketing e leads) e garantimos que a transação ocorra dentro de um
                ambiente seguro, comissionado e escalável.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-12">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Parâmetros do Modelo</CardTitle>
                <CardDescription>
                  Ajuste as variáveis para projetar o Gross TPV e a Receita (Take Rate).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Conversão da Base Ativa</Label>
                    <span className="font-mono text-sm font-medium">{conversionRate[0]}%</span>
                  </div>
                  <Slider
                    value={conversionRate}
                    onValueChange={setConversionRate}
                    max={100}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Volume estimado: {convertedUsers.toLocaleString('pt-BR')} transações/mês
                  </p>
                </div>
                <div className="space-y-3">
                  <Label>Ticket Médio (R$)</Label>
                  <Input
                    type="number"
                    value={avgTicket}
                    onChange={(e) => setAvgTicket(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Take Rate Plataforma</Label>
                    <span className="font-mono text-sm font-medium">{takeRate[0]}%</span>
                  </div>
                  <Slider value={takeRate} onValueChange={setTakeRate} max={10} step={0.1} />
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-primary text-primary-foreground">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-primary-foreground/80 text-sm font-medium">
                      Gross TPV Mensal Projetado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(monthlyTpv)}</div>
                  </CardContent>
                </Card>
                <Card className="bg-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Receita Mensal (Take Rate)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {formatCurrency(platformRevenue)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Projeção Anual (Crescimento 5% a.m.)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ChartContainer
                    config={{
                      tpv: { label: 'Gross TPV (R$)', color: 'hsl(var(--primary))' },
                      revenue: { label: 'Receita (R$)', color: 'hsl(var(--chart-2))' },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="month"
                          className="text-xs"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`}
                          className="text-xs"
                          tickLine={false}
                          axisLine={false}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              valueFormatter={(val) => formatCurrency(val as number)}
                            />
                          }
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="tpv" fill="var(--color-tpv)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <ArrowRightLeft className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Split de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Divisão automática de recebíveis na fonte. A transação é roteada pela Zoop e o valor
                é liquidado instantaneamente para: Fabricante (Valor do Produto), V MODA (Take
                rate/Comissão) e Afiliados (Bônus de indicação). Sem bitributação.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <ShieldCheck className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Conciliação B2B</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Painel unificado para o fabricante. Extinção do controle manual de boletos e
                transferências de "sacoleiras". Todas as vendas originadas pelo V MODA são
                conciliadas automaticamente via infraestrutura Zoop.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Banknote className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Antecipação de Recebíveis</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Oferta de liquidez para o fluxo de caixa dos fabricantes de moda. Permite que lojas
                de atacado recebam pagamentos parcelados de atacadistas à vista, assumindo a taxa de
                antecipação.
              </CardContent>
            </Card>
            <Card className="md:col-span-2 lg:col-span-3 bg-primary/5 border-primary/20">
              <CardHeader>
                <CreditCard className="w-8 h-8 text-primary mb-2" />
                <CardTitle>CréditoModa (Acesso a Crédito)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground max-w-4xl">
                Nossa linha de crédito proprietária turbinada pela Zoop. Através do histórico de
                navegação e intenção de compra no V MODA, construímos um score alternativo para
                conceder limite rotativo às "sacoleiras", permitindo que comprem mais do fabricante
                e paguem no longo prazo.
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tiers de Monetização: Financial Services/BaaS</CardTitle>
              <CardDescription>
                A evolução da parceria e destravamento de valor ao longo do tempo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-muted pl-6 ml-3 space-y-8 py-4">
                <div className="relative">
                  <div className="absolute -left-10 bg-background p-1 rounded-full border border-primary text-primary">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-semibold">Fase 1 (Curto Prazo): Checkout & Split</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Implementação do checkout transparente na plataforma V MODA com Split de
                    Pagamentos nativo via Zoop. Foco na captura do Take Rate básico (Taxa de
                    intermediação) e onboarding dos Top 60 Fabricantes.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-10 bg-background p-1 rounded-full border border-primary text-primary">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    Fase 2 (Médio Prazo): Conciliação e Antecipação
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Ativação do módulo financeiro no Painel do Fabricante (Retailer Dashboard).
                    Lançamento da opção de Antecipação de Recebíveis, gerando uma nova linha de
                    receita financeira líquida para a plataforma.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-10 bg-primary p-1 rounded-full text-primary-foreground shadow-sm">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">
                    Fase 3 (Longo Prazo): CréditoModa & BaaS
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Emissão de cartões white-label, criação de contas digitais para os maiores
                    compradores atacadistas e liberação do algoritmo de crédito proprietário.
                    Transformando o V MODA em um Banco Digital de Nicho para o mercado atacadista.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
