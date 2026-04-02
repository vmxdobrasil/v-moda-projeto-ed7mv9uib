import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRealtime } from '@/hooks/use-realtime'
import { getCustomers, Customer } from '@/services/customers'
import pb from '@/lib/pocketbase/client'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Download, Video, BookOpen, MapPin, Award, ArrowUpRight } from 'lucide-react'

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

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance e Benefícios</h1>
        <p className="text-muted-foreground">
          Acompanhe seus leads, status de exclusividade e acesse seus materiais.
        </p>
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

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Hub de Benefícios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className={`relative overflow-hidden ${!unlockedBenefits.ebook_15k ? 'opacity-70 grayscale' : ''}`}
          >
            <CardHeader>
              <BookOpen className="w-8 h-8 text-primary mb-2" />
              <CardTitle>E-book Especial</CardTitle>
              <CardDescription>Como faturar R$ 15.000,00</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled={!unlockedBenefits.ebook_15k}>
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
              {!unlockedBenefits.ebook_15k && (
                <p className="text-xs text-center mt-3 text-muted-foreground">Requer ranking TOP</p>
              )}
            </CardContent>
          </Card>

          <Card
            className={`relative overflow-hidden ${!unlockedBenefits.video_gallery ? 'opacity-70 grayscale' : ''}`}
          >
            <CardHeader>
              <Video className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Galeria de Vídeos</CardTitle>
              <CardDescription>60 melhores marcas de Goiás</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="secondary"
                disabled={!unlockedBenefits.video_gallery}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Acessar e Repostar
              </Button>
              {!unlockedBenefits.video_gallery && (
                <p className="text-xs text-center mt-3 text-muted-foreground">Requer ranking TOP</p>
              )}
            </CardContent>
          </Card>

          <Card
            className={`relative overflow-hidden ${!unlockedBenefits.revista_moda ? 'opacity-70 grayscale' : ''}`}
          >
            <CardHeader>
              <Award className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Revista MODA ATUAL</CardTitle>
              <CardDescription>Assinatura Digital Exclusiva</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                disabled={!unlockedBenefits.revista_moda}
              >
                Ler Edição Atual
              </Button>
              {!unlockedBenefits.revista_moda && (
                <p className="text-xs text-center mt-3 text-muted-foreground">Requer ranking TOP</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
