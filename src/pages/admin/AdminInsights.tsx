import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Users, MessageSquare, Server, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import pb from '@/lib/pocketbase/client'

export default function AdminInsights() {
  const [stats, setStats] = useState({
    leads: 0,
    messages: 0,
    instances: 0,
    activeAgents: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const [customersRes, messagesRes, insightsRes] = await Promise.all([
          pb
            .collection('customers')
            .getList(1, 1, { filter: 'status="new" || status="interested"' }),
          pb.collection('messages').getList(1, 1),
          pb.collection('market_insights').getList(1, 1),
        ])

        setStats({
          leads: customersRes.totalItems,
          messages: messagesRes.totalItems,
          instances: 3,
          activeAgents: insightsRes.totalItems,
        })
      } catch (e) {
        console.error('Error fetching stats:', e)
      }
    }
    fetchStats()
  }, [])

  const distributionData = [
    { name: 'WhatsApp', total: 450 },
    { name: 'Instagram', total: 200 },
    { name: 'Site', total: 150 },
    { name: 'Manual', total: 80 },
  ]

  const loadData = [
    { time: '08:00', value: 30 },
    { time: '10:00', value: 65 },
    { time: '12:00', value: 85 },
    { time: '14:00', value: 90 },
    { time: '16:00', value: 70 },
    { time: '18:00', value: 50 },
    { time: '20:00', value: 25 },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up p-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hub do Ecossistema Autônomo</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do tráfego, instâncias e distribuição de leads pelo ecossistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leads}</div>
            <p className="text-xs text-muted-foreground">Leads em negociação/novos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Trafegadas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messages}</div>
            <p className="text-xs text-muted-foreground">Volume total do sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pool de Instâncias</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.instances}</div>
            <p className="text-xs text-muted-foreground">Nós ativos conectando canais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAgents}</div>
            <p className="text-xs text-muted-foreground">Insights sendo monitorados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribuição de Canais</CardTitle>
            <CardDescription>Volume de leads por canal de aquisição</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                total: { label: 'Volume', color: 'hsl(var(--primary))' },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Carga do Pool</CardTitle>
            <CardDescription>Uso de instâncias ao longo do dia (%)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                value: { label: 'Carga %', color: 'hsl(var(--primary))' },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={loadData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
