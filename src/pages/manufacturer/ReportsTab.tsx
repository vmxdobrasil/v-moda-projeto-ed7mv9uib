import { useState, useEffect, useMemo } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import { Users, Target, TrendingUp } from 'lucide-react'
import { format, subDays, isAfter, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ReportsTab() {
  const [range, setRange] = useState('30days')
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = pb.authStore.record
        if (!user) return

        const records = await pb.collection('customers').getFullList({
          filter: `manufacturer = "${user.id}"`,
          sort: '-created',
        })
        setCustomers(records)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const { stats, leadsData, distributionData } = useMemo(() => {
    let days = 30
    if (range === '7days') days = 7
    if (range === 'year') days = 365

    const cutoffDate = subDays(new Date(), days)
    const filteredCustomers = customers.filter((c) => isAfter(parseISO(c.created), cutoffDate))

    const statusCounts = {
      new: 0,
      interested: 0,
      negotiating: 0,
      converted: 0,
      inactive: 0,
    }

    const dateMap: Record<string, number> = {}

    filteredCustomers.forEach((c) => {
      if (c.status && statusCounts[c.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[c.status as keyof typeof statusCounts]++
      }

      const dateKey = format(parseISO(c.created), days > 31 ? 'MMM yyyy' : 'dd/MM', {
        locale: ptBR,
      })
      dateMap[dateKey] = (dateMap[dateKey] || 0) + 1
    })

    const chartData = Object.entries(dateMap).map(([date, leads]) => ({
      date,
      leads,
    }))

    chartData.reverse() // Show oldest to newest in chart

    const distData = [
      { name: 'Novos', value: statusCounts.new, fill: 'hsl(var(--chart-1))' },
      { name: 'Interessados', value: statusCounts.interested, fill: 'hsl(var(--chart-2))' },
      { name: 'Negociando', value: statusCounts.negotiating, fill: 'hsl(var(--chart-3))' },
      { name: 'Convertidos', value: statusCounts.converted, fill: 'hsl(var(--chart-4))' },
    ]

    const totalLeads = filteredCustomers.length
    const convRate = totalLeads ? Math.round((statusCounts.converted / totalLeads) * 100) : 0

    return {
      stats: { total: totalLeads, converted: statusCounts.converted, rate: convRate },
      leadsData: chartData,
      distributionData: distData.filter((d) => d.value > 0),
    }
  }, [customers, range])

  const leadsConfig = {
    leads: { label: 'Novos Leads', color: 'hsl(var(--chart-1))' },
  }

  const pieConfig = {
    Novos: { label: 'Novos', color: 'hsl(var(--chart-1))' },
    Interessados: { label: 'Interessados', color: 'hsl(var(--chart-2))' },
    Negociando: { label: 'Negociando', color: 'hsl(var(--chart-3))' },
    Convertidos: { label: 'Convertidos', color: 'hsl(var(--chart-4))' },
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Desempenho & Analytics</h2>
          <p className="text-muted-foreground">
            Acompanhe a geração de leads e sua conversão em tempo real.
          </p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Últimos 7 dias</SelectItem>
            <SelectItem value="30days">Últimos 30 dias</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Processando dados...</div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Leads Convertidos</CardTitle>
                <Target className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.converted}</div>
                <p className="text-xs text-muted-foreground mt-1">Negociações fechadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rate}%</div>
                <p className="text-xs text-muted-foreground mt-1">Aproveitamento total</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Leads no Período</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={leadsConfig} className="min-h-[250px] w-full">
                  <BarChart data={leadsData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="leads" fill="var(--color-leads)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={pieConfig}
                  className="min-h-[250px] w-full flex items-center justify-center"
                >
                  {distributionData.length > 0 ? (
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  ) : (
                    <div className="text-sm text-muted-foreground">Nenhum dado para exibir.</div>
                  )}
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
