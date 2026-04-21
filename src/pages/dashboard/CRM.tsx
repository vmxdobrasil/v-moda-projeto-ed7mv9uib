import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getCustomers, type Customer } from '@/services/customers'
import { useRealtime } from '@/hooks/use-realtime'
import { Users, UserCheck, Clock, Ban, UserPlus } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

export default function CRM() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', () => loadData())

  const stats = useMemo(() => {
    const counts = {
      new: 0,
      interested: 0,
      negotiating: 0,
      converted: 0,
      inactive: 0,
    }
    customers.forEach((c) => {
      if (c.status && counts[c.status as keyof typeof counts] !== undefined) {
        counts[c.status as keyof typeof counts]++
      }
    })
    return counts
  }, [customers])

  const total = customers.length

  const chartData = [
    { name: 'Novos', value: stats.new, fill: 'hsl(var(--chart-1))', status: 'new' },
    {
      name: 'Interessados',
      value: stats.interested,
      fill: 'hsl(var(--chart-2))',
      status: 'interested',
    },
    {
      name: 'Em Negociação',
      value: stats.negotiating,
      fill: 'hsl(var(--chart-3))',
      status: 'negotiating',
    },
    {
      name: 'Convertidos',
      value: stats.converted,
      fill: 'hsl(var(--chart-4))',
      status: 'converted',
    },
    { name: 'Inativos', value: stats.inactive, fill: 'hsl(var(--chart-5))', status: 'inactive' },
  ]

  const chartConfig = {
    value: { label: 'Clientes' },
    new: { label: 'Novos', color: 'hsl(var(--chart-1))' },
    interested: { label: 'Interessados', color: 'hsl(var(--chart-2))' },
    negotiating: { label: 'Em Negociação', color: 'hsl(var(--chart-3))' },
    converted: { label: 'Convertidos', color: 'hsl(var(--chart-4))' },
    inactive: { label: 'Inativos', color: 'hsl(var(--chart-5))' },
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-fade-in">Carregando CRM...</div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">CRM & Vendas</h1>
        <p className="text-muted-foreground">
          Acompanhe o funil de conversão e as métricas de relacionamento com seus clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Novos Leads</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <p className="text-xs text-muted-foreground">
              {total ? Math.round((stats.new / total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interessados</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.interested}</div>
            <p className="text-xs text-muted-foreground">
              {total ? Math.round((stats.interested / total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Negociação</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.negotiating}</div>
            <p className="text-xs text-muted-foreground">
              {total ? Math.round((stats.negotiating / total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
            <p className="text-xs text-muted-foreground">
              {total ? Math.round((stats.converted / total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {total ? Math.round((stats.inactive / total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição do Funil</CardTitle>
            <CardDescription>
              Visão geral dos clientes por status no funil de vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume por Status</CardTitle>
            <CardDescription>
              Comparativo direto do volume de clientes em cada etapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
