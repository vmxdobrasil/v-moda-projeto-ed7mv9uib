import { useState, useEffect, useMemo } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Calendar, Printer, Target, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from 'recharts'
import { format, subMonths, isAfter, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Reports() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const records = await pb.collection('customers').getFullList({ sort: '-created' })
        setCustomers(records)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const { stats, conversionData, distributionData } = useMemo(() => {
    const statusCounts = {
      new: 0,
      interested: 0,
      negotiating: 0,
      converted: 0,
      inactive: 0,
    }

    const monthsMap: Record<string, { new: number; converted: number }> = {}
    const sixMonthsAgo = subMonths(new Date(), 6)

    customers.forEach((c) => {
      if (c.status && statusCounts[c.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[c.status as keyof typeof statusCounts]++
      }

      const createdDate = parseISO(c.created)
      if (isAfter(createdDate, sixMonthsAgo)) {
        const monthKey = format(createdDate, 'MMM yyyy', { locale: ptBR })
        if (!monthsMap[monthKey]) {
          monthsMap[monthKey] = { new: 0, converted: 0 }
        }
        monthsMap[monthKey].new++
        if (c.status === 'converted') {
          monthsMap[monthKey].converted++
        }
      }
    })

    const chartData = Object.entries(monthsMap)
      .map(([month, data]) => ({
        month,
        novos: data.new,
        convertidos: data.converted,
      }))
      .reverse()

    const distData = [
      { name: 'Novos', value: statusCounts.new, fill: 'hsl(var(--chart-1))' },
      { name: 'Interessados', value: statusCounts.interested, fill: 'hsl(var(--chart-2))' },
      { name: 'Negociando', value: statusCounts.negotiating, fill: 'hsl(var(--chart-3))' },
      { name: 'Convertidos', value: statusCounts.converted, fill: 'hsl(var(--chart-4))' },
      { name: 'Inativos', value: statusCounts.inactive, fill: 'hsl(var(--chart-5))' },
    ]

    const totalLeads = customers.length
    const convRate = totalLeads ? Math.round((statusCounts.converted / totalLeads) * 100) : 0

    return {
      stats: { total: totalLeads, converted: statusCounts.converted, rate: convRate },
      conversionData: chartData,
      distributionData: distData,
    }
  }, [customers])

  const conversionConfig = {
    novos: { label: 'Novos Leads', color: 'hsl(var(--chart-1))' },
    convertidos: { label: 'Leads Convertidos', color: 'hsl(var(--chart-2))' },
  }

  const distributionConfig = {
    value: { label: 'Leads' },
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando relatórios...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios Analíticos</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Visualize métricas de conversão e crescimento de leads.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Últimos 6 Meses
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider">V Moda</h1>
        <h2 className="text-xl font-semibold mt-2">Relatório de Crescimento e Conversão</h2>
        <p className="text-sm text-muted-foreground">
          Gerado em: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Registrados no sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leads Convertidos</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.converted}</div>
            <p className="text-xs text-muted-foreground mt-1">Clientes ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão Global</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Dos leads se tornaram clientes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Crescimento e Conversão Mensal
            </CardTitle>
            <CardDescription className="print:hidden">
              Comparativo de novos leads x leads convertidos nos últimos 6 meses.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={conversionConfig} className="h-[300px] w-full">
              <BarChart data={conversionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  fontSize={12}
                />
                <YAxis axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="novos" fill="var(--color-novos)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="convertidos" fill="var(--color-convertidos)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Distribuição por Status
            </CardTitle>
            <CardDescription className="print:hidden">
              Visão atual do funil de conversão.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={distributionConfig} className="h-[300px] w-full">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
