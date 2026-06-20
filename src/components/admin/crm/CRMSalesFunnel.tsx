import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import pb from '@/lib/pocketbase/client'

const chartConfig = {
  value: { label: 'Clientes', color: 'hsl(var(--primary))' },
} satisfies ChartConfig

export function CRMSalesFunnel() {
  const [data, setData] = useState<{ stage: string; value: number }[]>([])
  const [period, setPeriod] = useState('30')
  const [memberType, setMemberType] = useState('all')

  useEffect(() => {
    async function fetchData() {
      const date = new Date()
      date.setDate(date.getDate() - parseInt(period, 10))
      const dateStr = date.toISOString()

      let filter = `created >= "${dateStr}"`
      if (memberType !== 'all') {
        filter += ` && source = '${memberType}'`
      }

      try {
        const records = await pb.collection('customers').getFullList({
          filter,
          fields: 'status',
        })

        const counts = records.reduce((acc: Record<string, number>, curr) => {
          const s = curr.status || 'new'
          acc[s] = (acc[s] || 0) + 1
          return acc
        }, {})

        const leads = (counts['new'] || 0) + (counts['lead'] || 0) + (counts['contact'] || 0)
        const qualified = (counts['interested'] || 0) + (counts['qualified'] || 0)
        const negotiation =
          (counts['negotiating'] || 0) + (counts['negotiation'] || 0) + (counts['proposal'] || 0)
        const closed = (counts['converted'] || 0) + (counts['closed'] || 0)

        setData([
          { stage: 'Leads', value: leads },
          { stage: 'Qualificados', value: qualified },
          { stage: 'Em Negociação', value: negotiation },
          { stage: 'Fechados', value: closed },
        ])
      } catch (err) {
        console.error('Error fetching sales funnel data', err)
      }
    }
    fetchData()
  }, [period, memberType])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle>Funil de Vendas Consolidado</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
            <Select value={memberType} onValueChange={setMemberType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Origens</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="site">Site</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-[400px]">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="stage" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip
              cursor={{ fill: 'var(--accent)' }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} barSize={50} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
