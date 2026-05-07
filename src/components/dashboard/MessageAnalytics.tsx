import { useEffect, useState, useMemo } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, MessageSquare } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

export function MessageAnalytics() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const sevenDaysAgo = startOfDay(subDays(new Date(), 6)).toISOString()
      const records = await pb.collection('messages').getFullList({
        filter: `created >= "${sevenDaysAgo.replace('T', ' ')}"`,
      })
      setMessages(records)
    } catch (e) {
      console.error('Failed to load messages', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('messages', loadData)

  const chartData = useMemo(() => {
    const end = endOfDay(new Date())
    const start = startOfDay(subDays(new Date(), 6))
    const days = eachDayOfInterval({ start, end })

    const data = days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayMessages = messages.filter((m) => msgDateStr(m.created) === dayStr)
      return {
        date: format(day, 'dd/MM', { locale: ptBR }),
        inbound: dayMessages.filter((m) => m.direction === 'inbound').length,
        outbound: dayMessages.filter((m) => m.direction === 'outbound').length,
      }
    })

    return data
  }, [messages])

  function msgDateStr(dateStr: string) {
    if (!dateStr) return ''
    return dateStr.split(' ')[0]
  }

  const chartConfig = {
    inbound: { label: 'Recebidas', color: 'hsl(var(--chart-1))' },
    outbound: { label: 'Enviadas', color: 'hsl(var(--chart-2))' },
  }

  return (
    <Card className="border-border/50 shadow-sm flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Volume de Mensagens
        </CardTitle>
        <CardDescription>Tráfego de mensagens nos últimos 7 dias</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--muted-foreground)/0.2)"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="inbound"
                  fill="var(--color-inbound)"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                  maxBarSize={40}
                />
                <Bar
                  dataKey="outbound"
                  fill="var(--color-outbound)"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
