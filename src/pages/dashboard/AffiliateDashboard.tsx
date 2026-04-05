import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getReferrals, type Referral } from '@/services/referrals'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { Link2, Users, DollarSign, TrendingUp, MapPin, QrCode } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function AffiliateDashboard() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const user = pb.authStore.record

  const loadData = async () => {
    try {
      const data = await getReferrals()
      setReferrals(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('referrals', () => {
    loadData()
  })

  const metrics = useMemo(() => {
    const clicks = referrals.filter((r) => r.type === 'click').length
    const leads = referrals.filter((r) => r.type === 'lead').length
    const conversions = referrals.filter((r) => r.type === 'conversion').length

    const commissionRate = user?.commission_rate || 10
    const avgTicket = 500
    const estimatedCommissions = conversions * avgTicket * (commissionRate / 100)

    const hubsCount: Record<string, number> = {}
    referrals.forEach((r) => {
      const hub = r.expand?.brand?.city || r.expand?.brand?.state || 'Online'
      hubsCount[hub] = (hubsCount[hub] || 0) + 1
    })

    const topHubs = Object.entries(hubsCount)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    const conversionRate = clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : '0.0'

    return { clicks, leads, conversions, estimatedCommissions, topHubs, conversionRate }
  }, [referrals, user])

  const copyAffiliateLink = () => {
    if (!user?.affiliate_code) return
    const link = `${window.location.origin}/afiliados?ref=${user.affiliate_code}`
    navigator.clipboard.writeText(link)
    toast({ title: 'Link copiado com sucesso!' })
  }

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground animate-fade-in">
        Carregando painel do guia...
      </div>
    )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel do Guia / Transporter</h1>
        <p className="text-muted-foreground">
          Acompanhe suas comissões, leads gerados e hubs de moda populares na sua caravana.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total de Cliques <Link2 className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.clicks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Leads da Caravana <Users className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.leads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Vendas (Conversões) <TrendingUp className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{metrics.conversions}</div>
            <p className="text-xs text-muted-foreground mt-1">Taxa: {metrics.conversionRate}%</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-400 flex items-center justify-between">
              Comissões Estimadas <DollarSign className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              R${' '}
              {metrics.estimatedCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-green-600/80 mt-1">
              Baseado na taxa de {user?.commission_rate || 10}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Hubs de Moda Populares
            </CardTitle>
            <CardDescription>Regiões com mais engajamento através da sua atuação</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.topHubs.length > 0 ? (
              <div className="h-[250px] w-full mt-4">
                <ChartContainer config={{ value: { label: 'Acessos' } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.topHubs}
                      layout="vertical"
                      margin={{ top: 0, right: 0, left: 20, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        fontSize={12}
                        width={100}
                      />
                      <ChartTooltip
                        cursor={{ fill: 'transparent' }}
                        content={<ChartTooltipContent />}
                      />
                      <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        fill="hsl(var(--primary))"
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                Dados insuficientes de localização.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meu Link & Ferramentas</CardTitle>
            <CardDescription>Recursos Exclusivos de Logística</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Link de Indicação Único</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted p-2.5 rounded-md text-sm font-mono truncate border">
                  {window.location.origin}/afiliados?ref={user?.affiliate_code || '...'}
                </div>
                <Button onClick={copyAffiliateLink}>Copiar</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Compartilhe nos grupos de WhatsApp da sua caravana.
              </p>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Check-in de Embarque & Logística
              </h3>
              <p className="text-sm text-muted-foreground">
                Acesse o Mini CRM para gerar o QR Code dos lojistas, organizar a lista de poltronas
                e verificar a entrega das mercadorias.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="/beneficios">Acessar Mini CRM (Logística)</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Lojistas Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referrals.slice(0, 5).map((ref) => (
              <div
                key={ref.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">
                    {ref.expand?.brand?.name || 'Cliente Oculto'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(ref.created).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Badge
                  variant={ref.type === 'conversion' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {ref.type}
                </Badge>
              </div>
            ))}
            {referrals.length === 0 && (
              <p className="text-center text-muted-foreground py-4 border-dashed border-2 rounded-xl">
                Nenhuma indicação registrada na sua rede ainda.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
