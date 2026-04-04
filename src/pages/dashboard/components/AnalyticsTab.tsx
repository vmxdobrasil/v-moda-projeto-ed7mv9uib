import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, XAxis, PieChart, Pie, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

export default function AnalyticsTab({ customers }: { customers: any[] }) {
  const leadsPerDay = useMemo(() => {
    const data = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      data.push({
        date: dateStr,
        leads: customers.filter((c) => c.created.startsWith(dateStr)).length,
      })
    }
    return data
  }, [customers])

  const leadsBySource = useMemo(() => {
    const counts = customers.reduce(
      (acc, c) => {
        const s = c.source || 'manual'
        acc[s] = (acc[s] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      fill: `hsl(var(--chart-${(i % 5) + 1}))`,
    }))
  }, [customers])

  const barConfig = {
    leads: { label: 'Leads Capturados', color: 'hsl(var(--primary))' },
  }

  const pieConfig = {
    whatsapp: { label: 'WhatsApp (MEO Zap)', color: 'hsl(var(--chart-1))' },
    instagram: { label: 'Instagram', color: 'hsl(var(--chart-2))' },
    email: { label: 'Email', color: 'hsl(var(--chart-3))' },
    manual: { label: 'Manual', color: 'hsl(var(--chart-4))' },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Aquisição de Leads (30 dias)</CardTitle>
          <CardDescription>Evolução diária de novos contatos no CRM</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="h-[320px] w-full">
            <BarChart data={leadsPerDay} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const parts = value.split('-')
                  return `${parts[2]}/${parts[1]}`
                }}
                fontSize={12}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="leads"
                fill="var(--color-leads)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Origem dos Leads</CardTitle>
          <CardDescription>Distribuição por canal de captação</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center pb-8">
          <ChartContainer config={pieConfig} className="h-[320px] w-full max-w-[350px]">
            <PieChart>
              <Pie
                data={leadsBySource}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
              >
                {leadsBySource.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} className="mt-8" />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
