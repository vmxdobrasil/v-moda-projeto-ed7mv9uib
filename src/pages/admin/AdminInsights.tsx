import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Activity,
  Calculator,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function AdminInsights() {
  const [logs, setLogs] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const { toast } = useToast()

  const loadLogs = async () => {
    try {
      const records = await pb.collection('user_behavior_logs').getList(1, 15, {
        sort: '-created',
        expand: 'user',
      })
      setLogs(records.items)
    } catch (e) {
      console.error(e)
    }
  }

  const loadInsights = async () => {
    try {
      const records = await pb.collection('market_insights').getList(1, 15, {
        sort: '-created',
      })
      setInsights(records.items)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadLogs()
    loadInsights()
  }, [])

  useRealtime('user_behavior_logs', () => loadLogs())
  useRealtime('market_insights', () => loadInsights())

  const simulateAction = async (actionType: string) => {
    try {
      const { trackEvent } = await import('@/lib/tracking')
      await trackEvent(actionType as any, { product_id: 'prd_singapore_123', price: 299.9 })
      toast({
        title: 'Ação Simulada',
        description: `Evento '${actionType}' enviado com sucesso.`,
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Falha ao simular ação.',
        variant: 'destructive',
      })
    }
  }

  const resolveInsight = async (id: string) => {
    try {
      await pb.collection('market_insights').update(id, { is_resolved: true })
      toast({ title: 'Insight Resolvido' })
      loadInsights()
    } catch (e) {
      toast({ title: 'Erro ao resolver', variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Motor OODA (Singapore System)
          </h1>
          <p className="text-muted-foreground mt-1">
            Inteligência de mercado automatizada. Observe os logs em tempo real e os insights
            gerados.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => simulateAction('view_product')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Simular View
          </Button>
          <Button variant="secondary" size="sm" onClick={() => simulateAction('calculator_use')}>
            <Calculator className="w-4 h-4 mr-2" />
            Simular Calculadora
          </Button>
          <Button variant="secondary" size="sm" onClick={() => simulateAction('checkout_start')}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Simular Checkout
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col h-[600px] border-primary/20 shadow-md">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Market Insights (Ações)
            </CardTitle>
            <CardDescription>Oportunidades mapeadas pelo algoritmo OODA.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 space-y-4 bg-muted/30">
            {insights.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <RefreshCw className="h-10 w-10 mb-4 animate-spin-slow opacity-20" />
                <p>O algoritmo está analisando padrões...</p>
              </div>
            ) : (
              insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 border rounded-xl bg-card shadow-sm transition-all duration-300 hover:shadow-md ${insight.is_resolved ? 'opacity-60 grayscale' : 'border-l-4 border-l-primary'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant={
                        insight.insight_type === 'low_conversion' ? 'destructive' : 'default'
                      }
                      className="uppercase text-[10px] tracking-wider font-bold"
                    >
                      {insight.insight_type.replace('_', ' ')}
                    </Badge>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-black text-primary leading-none">
                        {insight.score}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">
                        Score
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">
                        Entidade
                      </p>
                      <p className="font-semibold">{insight.entity_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">
                        ID Ref
                      </p>
                      <p className="font-mono text-xs">{insight.entity_id}</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg border text-sm">
                    <strong className="block mb-1 text-primary">Ação Recomendada:</strong>
                    <p className="text-muted-foreground leading-relaxed">
                      {insight.suggested_action}
                    </p>
                  </div>
                  {!insight.is_resolved && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveInsight(insight.id)}
                      >
                        Marcar como Resolvido
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col h-[600px] shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Stream de Verificação (Logs)
            </CardTitle>
            <CardDescription>Eventos brutos capturados na sessão e dispositivo.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <Table>
              <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10">
                <TableRow>
                  <TableHead className="w-[120px]">Evento / Rota</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Dispositivo / Metadados</TableHead>
                  <TableHead className="text-right">Horário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      Nenhum evento registrado recentemente.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="animate-fade-in-up">
                      <TableCell>
                        <Badge variant="outline" className="bg-muted font-mono text-[10px]">
                          {log.action_type}
                        </Badge>
                        <div className="text-[10px] text-muted-foreground mt-1 font-mono truncate max-w-[120px]">
                          {log.path}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {log.expand?.user?.email || (
                          <span className="text-muted-foreground italic">Sessão Anônima</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground max-w-[200px]">
                        <div className="truncate mb-1">MD: {JSON.stringify(log.metadata)}</div>
                        <div className="truncate text-[10px] opacity-70">
                          DV: {JSON.stringify(log.device_info)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right whitespace-nowrap text-muted-foreground">
                        {new Date(log.created).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
