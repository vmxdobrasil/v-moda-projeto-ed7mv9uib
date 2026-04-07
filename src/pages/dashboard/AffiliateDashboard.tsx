import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getReferrals, type Referral } from '@/services/referrals'
import { getReferredCustomers, type Customer } from '@/services/customers'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import {
  Link2,
  Users,
  DollarSign,
  TrendingUp,
  MapPin,
  QrCode,
  Download,
  Shield,
  Award,
  Star,
  Trophy,
  Crown,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export default function AffiliateDashboard() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [referredCustomers, setReferredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const user = pb.authStore.record

  const loadData = async () => {
    try {
      const [refData, custData] = await Promise.all([getReferrals(), getReferredCustomers()])
      setReferrals(refData)
      setReferredCustomers(custData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('referrals', () => loadData())
  useRealtime('customers', () => loadData())
  useRealtime('notifications', () => {}) // Trigger reactivity when notifications arrive

  const gamification = useMemo(() => {
    const convertedCount = referredCustomers.filter((c) => c.status === 'converted').length
    let badge
    if (convertedCount <= 5)
      badge = {
        name: 'Afiliado Iniciante',
        min: 0,
        max: 5,
        color: 'text-slate-500',
        bg: 'bg-slate-100 dark:bg-slate-800',
        icon: Shield,
      }
    else if (convertedCount <= 20)
      badge = {
        name: 'Bronze',
        min: 6,
        max: 20,
        color: 'text-amber-600',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        icon: Award,
      }
    else if (convertedCount <= 50)
      badge = {
        name: 'Prata',
        min: 21,
        max: 50,
        color: 'text-zinc-500',
        bg: 'bg-zinc-100 dark:bg-zinc-800',
        icon: Star,
      }
    else if (convertedCount <= 100)
      badge = {
        name: 'Ouro',
        min: 51,
        max: 100,
        color: 'text-yellow-500',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        icon: Trophy,
      }
    else
      badge = {
        name: 'Diamante',
        min: 101,
        max: Infinity,
        color: 'text-cyan-500',
        bg: 'bg-cyan-100 dark:bg-cyan-900/30',
        icon: Crown,
      }

    const target = badge.max === Infinity ? convertedCount : badge.max + 1
    const progressValue = badge.max === Infinity ? 100 : (convertedCount / target) * 100

    return { badge, count: convertedCount, target, progress: progressValue }
  }, [referredCustomers])

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

  const handleExport = () => {
    const headers = ['Nome do Cliente', 'Status', 'Data de Criação', 'Origem']
    const rows = referredCustomers.map((c) => {
      const name = `"${(c.name || '').replace(/"/g, '""')}"`
      const status = `"${(c.status || '').replace(/"/g, '""')}"`
      const date = `"${new Date(c.created).toLocaleDateString('pt-BR')}"`
      const source = `"${(c.source || '').replace(/"/g, '""')}"`
      return [name, status, date, source].join(',')
    })
    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `relatorio_performance_${new Date().toISOString().split('T')[0]}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: 'Relatório exportado com sucesso!' })
  }

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground animate-fade-in">
        Carregando painel do guia...
      </div>
    )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel do Guia / Transporter</h1>
          <p className="text-muted-foreground">
            Acompanhe suas comissões, leads gerados e hubs de moda populares na sua caravana.
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="shrink-0 bg-background">
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório (CSV)
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">Nível de Desempenho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div
                className={cn('p-4 rounded-full', gamification.badge.bg, gamification.badge.color)}
              >
                <gamification.badge.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className={cn('text-2xl font-bold', gamification.badge.color)}>
                  {gamification.badge.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {gamification.count} conversões realizadas
                </p>
              </div>
            </div>
            <div className="flex-1 w-full space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Progresso para o próximo nível</span>
                <span>
                  {gamification.badge.max === Infinity
                    ? 'Nível Máximo'
                    : `${gamification.count} / ${gamification.target}`}
                </span>
              </div>
              <Progress value={gamification.progress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex justify-between">
              Cliques <Link2 className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.clicks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex justify-between">
              Leads <Users className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.leads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex justify-between">
              Conversões <TrendingUp className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{metrics.conversions}</div>
            <p className="text-xs text-muted-foreground mt-1">Taxa: {metrics.conversionRate}%</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-800 dark:text-green-400 flex justify-between">
              Comissões Estimadas <DollarSign className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              R${' '}
              {metrics.estimatedCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-green-600/80 mt-1">Taxa de {user?.commission_rate || 10}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Hubs de Moda Populares
            </CardTitle>
            <CardDescription>Regiões com mais engajamento</CardDescription>
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
                Dados insuficientes.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meu Link & Ferramentas</CardTitle>
            <CardDescription>Recursos Exclusivos</CardDescription>
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
            </div>
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Check-in de Embarque
              </h3>
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
                Nenhuma indicação registrada.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
