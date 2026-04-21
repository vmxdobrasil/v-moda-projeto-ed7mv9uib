import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts'

export function ReportsTab() {
  const [range, setRange] = useState('30days')
  const [leadsData, setLeadsData] = useState<any[]>([])
  const [conversionData, setConversionData] = useState<any[]>([])

  useEffect(() => {
    // Analytics Mock Data for the Partner Dashboard
    setLeadsData([
      { month: 'Jan', leads: 45 },
      { month: 'Fev', leads: 52 },
      { month: 'Mar', leads: 38 },
      { month: 'Abr', leads: 65 },
      { month: 'Mai', leads: 80 },
      { month: 'Jun', leads: 95 },
    ])

    setConversionData([
      { date: 'Sem 1', rate: 12 },
      { date: 'Sem 2', rate: 15 },
      { date: 'Sem 3', rate: 14 },
      { date: 'Sem 4', rate: 18 },
    ])
  }, [range])

  const leadsConfig = {
    leads: { label: 'Novos Leads', color: 'hsl(var(--primary))' },
  }

  const conversionConfig = {
    rate: { label: 'Taxa de Conversão (%)', color: 'hsl(var(--accent))' },
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Desempenho & Analytics</h2>
          <p className="text-muted-foreground">Acompanhe a geração de leads e conversão.</p>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Leads por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={leadsConfig} className="min-h-[250px] w-full">
              <BarChart data={leadsData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="leads" fill="var(--color-leads)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Taxa de Conversão (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={conversionConfig} className="min-h-[250px] w-full">
              <LineChart data={conversionData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--color-rate)"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
