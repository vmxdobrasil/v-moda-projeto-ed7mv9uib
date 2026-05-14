import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import pb from '@/lib/pocketbase/client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Users, MessageSquare, Server, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export default function DashboardHub() {
  const [leadsCount, setLeadsCount] = useState(0)
  const [messagesCount, setMessagesCount] = useState(0)
  const [sourceData, setSourceData] = useState<any[]>([])
  const [instances, setInstances] = useState<{ id: string; status: string }[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const customers = await pb.collection('customers').getFullList({ fields: 'id,source' })
      setLeadsCount(customers.length)

      const sources = customers.reduce((acc, c) => {
        const s = c.source || 'manual'
        acc[s] = (acc[s] || 0) + 1
        return acc
      }, {} as any)

      const chartData = Object.keys(sources).map((k) => ({
        name: k.replace('_', ' ').toUpperCase(),
        value: sources[k],
      }))
      setSourceData(chartData)

      const msgs = await pb.collection('messages').getList(1, 1)
      setMessagesCount(msgs.totalItems)

      const configs = await pb.collection('whatsapp_configs').getFullList()
      let allInst: string[] = []
      configs.forEach((c) => {
        if (c.instance_id) {
          allInst = allInst.concat(c.instance_id.split(',').map((i) => i.trim()))
        }
      })

      const instStatus = allInst.map((inst) => ({ id: inst, status: 'configured' }))
      setInstances(instStatus)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', loadData)
  useRealtime('messages', loadData)

  const poolTotal = instances.length

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hub do Ecossistema Autônomo</h1>
        <p className="text-muted-foreground">
          Monitore o volume de extração de leads, disparos de mensagens e a saúde do pool de
          instâncias do WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads (Capturados)</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{leadsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Base consolidada</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Trafegadas</CardTitle>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{messagesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Enviadas e recebidas</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pool de Instâncias</CardTitle>
            <Server className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-600">{poolTotal}</span>
              <span className="text-lg text-muted-foreground ml-2">instâncias</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Capacidade de balanceamento</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Distribuição de Leads por Origem</CardTitle>
            <CardDescription>
              Volume de captação de acordo com a fonte (Grupos, Instagram, Manual)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Nenhum dado de origem disponível.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Instâncias do Pool</CardTitle>
            <CardDescription>
              Instâncias configuradas na Evolution API para envio de mensagens
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : instances.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground border rounded-md border-dashed">
                Nenhuma instância configurada no Load Balancer.
              </div>
            ) : (
              <div className="space-y-4">
                {instances.map((inst) => (
                  <div
                    key={inst.id}
                    className="flex items-center justify-between p-3 border rounded-md bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <Server className="w-4 h-4 text-primary" />
                      <span className="font-medium">{inst.id}</span>
                    </div>
                    <div>
                      <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Configurada
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
