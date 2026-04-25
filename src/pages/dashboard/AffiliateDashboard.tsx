import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getReferrals, type Referral } from '@/services/referrals'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import {
  Link2,
  Users,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, subDays } from 'date-fns'
import { Navigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

const chartConfig = {
  clicks: { label: 'Cliques', color: 'hsl(var(--primary))' },
  leads: { label: 'Leads', color: 'hsl(var(--chart-2))' },
  conversions: { label: 'Conversões', color: 'hsl(var(--chart-3))' },
}

const statusMap: Record<string, string> = {
  new: 'Novo',
  interested: 'Interessado',
  negotiating: 'Em Negociação',
  converted: 'Convertido',
  inactive: 'Inativo',
}

const typeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  click: { label: 'Clique', variant: 'outline' },
  lead: { label: 'Lead', variant: 'secondary' },
  conversion: { label: 'Conversão', variant: 'default' },
}

export default function AffiliateDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const limit = 10

  const isAdmin = user?.email === 'valterpmendonca@gmail.com' || user?.role === 'admin'

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

  useRealtime('referrals', () => loadData())

  const metrics = useMemo(() => {
    let clicks = 0,
      leads = 0,
      conversions = 0
    referrals.forEach((r) => {
      if (r.type === 'click') clicks++
      else if (r.type === 'lead') leads++
      else if (r.type === 'conversion') conversions++
    })
    const commissionRate = user?.commission_rate || 10
    const avgTicket = 500 // estimated ticket value
    const earnings = conversions * avgTicket * (commissionRate / 100)
    return { clicks, leads, conversions, earnings }
  }, [referrals, user])

  const chartData = useMemo(() => {
    const days = Array.from({ length: 30 }).map((_, i) => {
      const d = subDays(new Date(), 29 - i)
      return {
        date: format(d, 'dd/MM'),
        fullDate: format(d, 'yyyy-MM-dd'),
        clicks: 0,
        leads: 0,
        conversions: 0,
      }
    })
    referrals.forEach((ref) => {
      const refDate = format(new Date(ref.created), 'yyyy-MM-dd')
      const dayMatch = days.find((d) => d.fullDate === refDate)
      if (dayMatch) {
        if (ref.type === 'click') dayMatch.clicks++
        if (ref.type === 'lead') dayMatch.leads++
        if (ref.type === 'conversion') dayMatch.conversions++
      }
    })
    return days
  }, [referrals])

  const filteredReferrals = useMemo(() => {
    return referrals.filter((r) => typeFilter === 'all' || r.type === typeFilter)
  }, [referrals, typeFilter])

  const totalPages = Math.ceil(filteredReferrals.length / limit)
  const paginatedReferrals = filteredReferrals.slice((page - 1) * limit, page * limit)

  if (user?.role !== 'affiliate' && !isAdmin) {
    return <Navigate to="/" replace />
  }

  const affiliateLink = `${window.location.origin}/?ref=${user?.affiliate_code || ''}`
  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateLink)
    setCopied(true)
    toast({ title: 'Link de afiliado copiado!' })
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-fade-in">
        Carregando dashboard...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel de Afiliado</h1>
        <p className="text-muted-foreground">
          Acompanhe seu desempenho e gerencie seus links de indicação.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
              Cliques <Link2 className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.clicks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
              Leads <Users className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.leads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
              Conversões <TrendingUp className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.conversions}</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex justify-between">
              Ganhos Estimados <DollarSign className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {metrics.earnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-primary/80 mt-1">Taxa de {user?.commission_rate || 10}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Desempenho (Últimos 30 Dias)</CardTitle>
            <CardDescription>Evolução de cliques, leads e conversões.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--muted-foreground)/0.2)"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="var(--color-clicks)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    stroke="var(--color-leads)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="conversions"
                    stroke="var(--color-conversions)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seu Link Único</CardTitle>
            <CardDescription>Compartilhe para ganhar comissões.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Link Padrão</label>
              <div className="flex gap-2">
                <Input readOnly value={affiliateLink} className="font-mono text-sm bg-muted" />
                <Button
                  onClick={handleCopy}
                  variant={copied ? 'default' : 'secondary'}
                  className="shrink-0 w-24"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h3 className="font-medium text-sm mb-2">Código de Afiliado</h3>
              <Badge variant="outline" className="text-base px-3 py-1 font-mono">
                {user?.affiliate_code || 'N/A'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Histórico de Indicações</CardTitle>
            <CardDescription>Acompanhe todos os eventos gerados pelo seu link.</CardDescription>
          </div>
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Eventos</SelectItem>
              <SelectItem value="click">Apenas Cliques</SelectItem>
              <SelectItem value="lead">Apenas Leads</SelectItem>
              <SelectItem value="conversion">Apenas Conversões</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Marca / Cliente</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Status (Cliente)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReferrals.length > 0 ? (
                  paginatedReferrals.map((ref) => (
                    <TableRow key={ref.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {format(new Date(ref.created), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {ref.expand?.brand?.name || 'Cliente Anônimo'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeMap[ref.type]?.variant || 'default'}>
                          {typeMap[ref.type]?.label || ref.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {statusMap[ref.expand?.brand?.status || ''] || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              <div className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
