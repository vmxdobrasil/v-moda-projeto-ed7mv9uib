import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ArrowDownIcon, ArrowUpIcon, MinusIcon, TrendingUp, Download } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { format, subMonths, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function MonthlySales() {
  const { user } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!user) return
    try {
      const isAdmin = user.role === 'admin' || user.email === 'valterpmendonca@gmail.com'
      const filter = isAdmin
        ? `type = 'conversion'`
        : `type = 'conversion' && brand.manufacturer = "${user.id}"`

      const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5))
      const dateFilter = `created >= "${sixMonthsAgo.toISOString().replace('T', ' ')}"`

      const records = await pb.collection('referrals').getFullList({
        filter: `${filter} && ${dateFilter}`,
        sort: 'created',
        expand: 'brand',
      })

      setData(records)
    } catch (error) {
      console.error('Error fetching conversions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('referrals', () => {
    loadData()
  })

  const chartData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i)
      months.push({
        month: format(d, 'yyyy-MM'),
        label: format(d, 'MMM/yy', { locale: ptBR }),
        conversions: 0,
      })
    }

    data.forEach((record) => {
      const recordMonth = record.created.substring(0, 7)
      const monthData = months.find((m) => m.month === recordMonth)
      if (monthData) {
        monthData.conversions += 1
      }
    })

    return months
  }, [data])

  const handleExportCSV = () => {
    if (!data || data.length === 0) return

    const headers = ['Data', 'Marca/Cliente', 'Tipo', 'Canal de Origem']
    const rows = data.map((record) => {
      const date = new Date(record.created).toLocaleDateString('pt-BR')
      const brandName = record.expand?.brand?.name || 'N/A'
      const type = record.type === 'conversion' ? 'Conversão' : record.type
      const channel = record.source_channel || 'N/A'
      return `"${date}","${brandName}","${type}","${channel}"`
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    // Adiciona BOM para o Excel ler UTF-8 corretamente
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `vendas_${format(new Date(), 'yyyy-MM')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const currentMonthStr = format(new Date(), 'yyyy-MM')
  const previousMonthStr = format(subMonths(new Date(), 1), 'yyyy-MM')

  const currentMonthConversions =
    chartData.find((m) => m.month === currentMonthStr)?.conversions || 0
  const previousMonthConversions =
    chartData.find((m) => m.month === previousMonthStr)?.conversions || 0

  let growth = 0
  if (previousMonthConversions > 0) {
    growth = ((currentMonthConversions - previousMonthConversions) / previousMonthConversions) * 100
  } else if (currentMonthConversions > 0) {
    growth = 100
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="col-span-1">
          <CardHeader>
            <Skeleton className="h-5 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-[80px] mb-2" />
            <Skeleton className="h-4 w-[120px]" />
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const isPositive = growth > 0
  const isNegative = growth < 0
  const isNeutral = growth === 0

  const chartConfig = {
    conversions: {
      label: 'Conversões',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8 animate-fade-in-up">
      <Card className="col-span-1 flex flex-col justify-center border-border/50 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium">Volume de Vendas</CardTitle>
            <CardDescription>Conversões registradas neste mês</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            title="Exportar dados de vendas"
            disabled={data.length === 0 || loading}
            className="h-8"
          >
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Exportar</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{currentMonthConversions}</div>
          <div className="mt-4 flex items-center text-sm">
            <div
              className={cn(
                'flex items-center font-medium mr-2',
                isPositive && 'text-green-600',
                isNegative && 'text-red-600',
                isNeutral && 'text-muted-foreground',
              )}
            >
              {isPositive && <ArrowUpIcon className="mr-1 h-4 w-4" />}
              {isNegative && <ArrowDownIcon className="mr-1 h-4 w-4" />}
              {isNeutral && <MinusIcon className="mr-1 h-4 w-4" />}
              {Math.abs(growth).toFixed(1)}%
            </div>
            <span className="text-muted-foreground">em relação ao mês passado</span>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendência de Conversões
          </CardTitle>
          <CardDescription>Histórico de vendas dos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              Nenhuma venda registrada neste período.
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="label"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="conversions"
                    fill="var(--color-conversions)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
