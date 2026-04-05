import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRealtime } from '@/hooks/use-realtime'
import { getCustomers, Customer } from '@/services/customers'
import pb from '@/lib/pocketbase/client'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Download,
  Video,
  BookOpen,
  MapPin,
  Award,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Star,
} from 'lucide-react'

export default function Performance() {
  const [myCustomers, setMyCustomers] = useState<Customer[]>([])
  const [myProfile, setMyProfile] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const email = pb.authStore.record?.email

      const [customersData, profileData] = await Promise.all([
        getCustomers(),
        email
          ? pb
              .collection('customers')
              .getList<Customer>(1, 1, { filter: `email = "${email}"` })
              .catch(() => ({ items: [] }))
          : { items: [] },
      ])

      setMyCustomers(customersData)
      setMyProfile(profileData.items[0] || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', () => {
    loadData()
  })

  useRealtime('notifications', () => {
    // Escuta de notificações para manter o hub e métricas em tempo real sempre sincados
  })

  const chartData = useMemo(() => {
    const statusCounts = {
      new: 0,
      interested: 0,
      negotiating: 0,
      converted: 0,
      inactive: 0,
    }

    myCustomers.forEach((c) => {
      if (c.status in statusCounts) {
        statusCounts[c.status as keyof typeof statusCounts]++
      }
    })

    return [
      { name: 'Novos', value: statusCounts.new, fill: 'hsl(var(--chart-1))' },
      { name: 'Interessados', value: statusCounts.interested, fill: 'hsl(var(--chart-2))' },
      { name: 'Em Negociação', value: statusCounts.negotiating, fill: 'hsl(var(--chart-3))' },
      { name: 'Convertidos', value: statusCounts.converted, fill: 'hsl(var(--chart-4))' },
    ]
  }, [myCustomers])

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground animate-fade-in">
        Carregando métricas...
      </div>
    )

  const unlockedBenefits = myProfile?.unlocked_benefits || {}
  const hasTopRanking = !!(
    myProfile?.ranking_category &&
    myProfile?.ranking_position &&
    myProfile.ranking_position > 0
  )

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance e Benefícios</h1>
        <p className="text-muted-foreground">
          Acompanhe seus leads, status de exclusividade e acesse seus materiais.
        </p>
      </div>

      {hasTopRanking && (
        <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500 via-amber-600 to-amber-800 text-white shadow-lg">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Award className="w-64 h-64" />
          </div>
          <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-3 mb-4 text-yellow-200">
                <ShieldCheck className="w-8 h-8" />
                <span className="font-semibold tracking-widest uppercase text-sm">
                  Selo Oficial de Excelência
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                {myProfile?.ranking_category?.replace('_', ' ').toUpperCase() || 'MEMBRO EXCLUSIVO'}
              </h2>
              <p className="text-yellow-100 max-w-md">
                Reconhecimento oficial como revendedor de destaque da Revista MODA ATUAL para{' '}
                {new Date().getFullYear()}.
              </p>
            </div>

            <div className="bg-black/30 p-6 rounded-xl backdrop-blur-md border border-white/10 w-full md:w-auto text-center shrink-0">
              <p className="text-sm text-yellow-200/80 mb-1 uppercase tracking-widest">
                Titular do Selo
              </p>
              <p className="font-bold text-2xl mb-1">
                {myProfile?.name || 'Revendedor Autorizado'}
              </p>
              <p className="text-sm text-yellow-100 mb-6">
                Posição: TOP {myProfile?.ranking_position} •{' '}
                {myProfile?.is_exclusive ? 'Exclusividade Garantida' : 'Destaque'}
              </p>
              <Button
                variant="secondary"
                className="w-full bg-white text-amber-900 hover:bg-white/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Meu Selo Exclusivo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Cliques no WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myProfile?.whatsapp_clicks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Cliques no perfil da marca</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Avaliação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              {myProfile?.rating_average?.toFixed(1) || '0.0'}
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Baseado nas avaliações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myProfile?.rating_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Avaliações recebidas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Geração de Leads</CardTitle>
            <CardDescription>Distribuição atual dos seus contatos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer config={{ value: { label: 'Leads' } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip
                      cursor={{ fill: 'transparent' }}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Status de Zona
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myProfile?.exclusivity_zone ? (
                <div>
                  <p className="font-semibold text-lg">{myProfile.exclusivity_zone}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={myProfile.is_exclusive ? 'default' : 'secondary'}>
                      {myProfile.is_exclusive ? 'Exclusivo' : 'Não Exclusivo'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma zona de exclusividade definida.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Seu Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myProfile?.ranking_category ? (
                <div>
                  <p className="font-semibold capitalize">
                    {myProfile.ranking_category.replace('_', ' ')}
                  </p>
                  {myProfile.ranking_position && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Posição: TOP {myProfile.ranking_position}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Você ainda não possui um ranking atribuído.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Mini Esteira de Apoio</h2>
          {hasTopRanking && (
            <Badge
              variant="default"
              className="bg-green-600 hover:bg-green-700 font-semibold py-1.5 px-3"
            >
              <Zap className="w-4 h-4 mr-1.5" /> 80% de Desconto Ativo no ERP/CRM + IA
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className={`relative overflow-hidden border-t-4 border-t-primary transition-opacity ${!hasTopRanking ? 'opacity-75 grayscale-[0.2]' : ''}`}
          >
            <CardHeader>
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-3">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Biblioteca Digital</CardTitle>
              <CardDescription>E-book Especial de Vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-4 italic text-muted-foreground">
                "Como faturar R$ 15.000,00 todo mês vendendo Elegância e não roupa"
              </p>
              <Button className="w-full" disabled={!hasTopRanking}>
                <Download className="w-4 h-4 mr-2" />
                Baixar Material
              </Button>
              {!hasTopRanking && (
                <p className="text-xs text-center mt-3 text-muted-foreground">
                  Benefício exclusivo para ranking TOP
                </p>
              )}
            </CardContent>
          </Card>

          <Card
            className={`relative overflow-hidden border-t-4 border-t-accent transition-opacity ${!hasTopRanking ? 'opacity-75 grayscale-[0.2]' : ''}`}
          >
            <CardHeader>
              <div className="bg-accent/10 p-3 rounded-full w-fit mb-3">
                <Video className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Media Kit Exclusivo</CardTitle>
              <CardDescription>Repositório de vídeos para redes sociais</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-4 text-muted-foreground">
                Acesso aos vídeos das 60 melhores marcas do polo de moda de Goiás.
              </p>
              <Button className="w-full" variant="secondary" disabled={!hasTopRanking}>
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Acessar Repositório
              </Button>
              {!hasTopRanking && (
                <p className="text-xs text-center mt-3 text-muted-foreground">
                  Benefício exclusivo para ranking TOP
                </p>
              )}
            </CardContent>
          </Card>

          <Card
            className={`relative overflow-hidden border-t-4 border-t-yellow-500 transition-opacity ${!hasTopRanking ? 'opacity-75 grayscale-[0.2]' : ''}`}
          >
            <CardHeader>
              <div className="bg-yellow-500/10 p-3 rounded-full w-fit mb-3">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle>Assinatura Anual</CardTitle>
              <CardDescription>Revista MODA ATUAL</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-4 text-muted-foreground">
                Acesso direto à assinatura digital com todas as edições e reportagens exclusivas.
              </p>
              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                disabled={!hasTopRanking}
              >
                Acessar Assinatura
              </Button>
              {!hasTopRanking && (
                <p className="text-xs text-center mt-3 text-muted-foreground">
                  Benefício exclusivo para ranking TOP
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
