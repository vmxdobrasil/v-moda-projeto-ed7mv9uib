import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Activity,
  AlertCircle,
  CheckCircle,
  BrainCircuit,
  Eye,
  Check,
  Zap,
  MoreVertical,
} from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'

import {
  getDashboardStats,
  getRecentLogs,
  getPendingInsightsList,
  resolveInsight,
  createActionExecution,
} from '@/services/admin-insights'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ACTION_TYPE_MAP: Record<string, string> = {
  view_product: 'Visualizou Produto',
  add_to_favorites: 'Favoritou',
  search_term: 'Busca',
  abandoned_cart: 'Abandono Carrinho',
  calculator_use: 'Calculadora',
  checkout_start: 'Início Checkout',
}

const INSIGHT_TYPE_MAP: Record<string, { label: string; color: string }> = {
  low_conversion: {
    label: 'Baixa Conversão',
    color: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  },
  stock_out_risk: {
    label: 'Risco Ruptura',
    color: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
  },
  trending_up: { label: 'Em Alta', color: 'bg-green-500/10 text-green-500 hover:bg-green-500/20' },
  performance_alert: {
    label: 'Alerta de Desempenho',
    color: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  },
}

const ENTITY_TYPE_MAP: Record<string, string> = {
  brand: 'Marca',
  product: 'Produto',
  region: 'Região',
}

const PROVIDERS = [
  { id: 'whatsapp_evolution', label: 'WhatsApp (Evolution)' },
  { id: 'email', label: 'E-mail' },
  { id: 'firebase_fcm', label: 'Push Notification (FCM)' },
  { id: 'asaas_api', label: 'Financeiro (Asaas)' },
]

export default function AdminInsights() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalInteractions: 0,
    pendingInsights: 0,
    executionSuccessRate: 0,
  })
  const [logs, setLogs] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])

  const [selectedLogData, setSelectedLogData] = useState<any | null>(null)
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [executingId, setExecutingId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [newStats, newLogs, newInsights] = await Promise.all([
        getDashboardStats(),
        getRecentLogs(50),
        getPendingInsightsList(),
      ])

      setStats(newStats)
      setLogs(newLogs.items)
      setInsights(newInsights)
    } catch (err) {
      console.error('Failed to load insights data:', err)
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar as informações do dashboard.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('user_behavior_logs', loadData)
  useRealtime('market_insights', loadData)
  useRealtime('action_executions', loadData)

  const handleResolveInsight = async (id: string) => {
    try {
      setExecutingId(id)
      await resolveInsight(id)
      toast({ title: 'Insight resolvido com sucesso!' })
      await loadData()
    } catch (err) {
      toast({
        title: 'Erro ao resolver',
        description: 'Verifique sua conexão ou permissões.',
        variant: 'destructive',
      })
    } finally {
      setExecutingId(null)
    }
  }

  const handleExecuteAction = async (insightId: string, provider: string) => {
    if (!user) return
    try {
      setExecutingId(insightId)
      await createActionExecution(insightId, provider, user.id)
      await resolveInsight(insightId) // Auto-resolve upon action execution triggering

      toast({
        title: 'Ação estratégica disparada',
        description: `Execução agendada no provedor: ${provider}. Insight marcado como resolvido.`,
      })
      await loadData()
    } catch (err) {
      const errs = extractFieldErrors(err)
      toast({
        title: 'Erro ao disparar ação',
        description: Object.values(errs)[0] || 'Ocorreu um erro interno.',
        variant: 'destructive',
      })
    } finally {
      setExecutingId(null)
    }
  }

  const viewLogMetadata = (metadata: any) => {
    setSelectedLogData(metadata)
    setIsLogDialogOpen(true)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 animate-fade-in">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">OODA Insights</h2>
          <p className="text-muted-foreground">
            Observe, Oriente, Decida e Aja. Central de inteligência e analytics.
          </p>
        </div>
        <BrainCircuit className="h-10 w-10 text-primary opacity-20" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Interações</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalInteractions.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">Volume histórico capturado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights Pendentes</CardTitle>
            <AlertCircle
              className={cn(
                'h-4 w-4',
                stats.pendingInsights > 0 ? 'text-orange-500' : 'text-muted-foreground',
              )}
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.pendingInsights}</div>
            )}
            <p className="text-xs text-muted-foreground">Aguardando decisão estratégica</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucesso de Ações</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.executionSuccessRate}%</div>
            )}
            <p className="text-xs text-muted-foreground">Taxa de sucesso nas integrações</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Insights de Mercado</TabsTrigger>
          <TabsTrigger value="logs">Logs Comportamentais</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orientação e Decisão (Insights)</CardTitle>
              <CardDescription>
                Análises automatizadas pelo motor de inteligência que requerem sua atenção.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Score (0-100)</TableHead>
                    <TableHead className="max-w-[300px]">Sugestão / Motivo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Skeleton className="h-8 w-full max-w-sm mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : insights.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        Nenhum insight pendente no momento.
                      </TableCell>
                    </TableRow>
                  ) : (
                    insights.map((insight) => {
                      const typeConfig = INSIGHT_TYPE_MAP[insight.insight_type] || {
                        label: insight.insight_type,
                        color: 'bg-secondary text-secondary-foreground',
                      }
                      const isExecuting = executingId === insight.id

                      return (
                        <TableRow key={insight.id}>
                          <TableCell className="font-medium">
                            {ENTITY_TYPE_MAP[insight.entity_type] || insight.entity_type}
                            <span className="block text-xs text-muted-foreground font-normal truncate max-w-[150px]">
                              {insight.entity_id}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={typeConfig.color}>
                              {typeConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full',
                                    insight.score > 70
                                      ? 'bg-red-500'
                                      : insight.score > 40
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500',
                                  )}
                                  style={{ width: `${Math.min(Math.max(insight.score, 0), 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold">{insight.score || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell
                            className="max-w-[300px] truncate"
                            title={insight.suggested_action}
                          >
                            {insight.suggested_action || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolveInsight(insight.id)}
                                disabled={isExecuting}
                              >
                                {isExecuting ? (
                                  <Activity className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <Check className="h-4 w-4 mr-1 text-green-600" />
                                )}
                                Resolver
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" disabled={isExecuting}>
                                    <Zap className="h-4 w-4 mr-1" />
                                    Agir
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Disparar Ação Via</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {PROVIDERS.map((p) => (
                                    <DropdownMenuItem
                                      key={p.id}
                                      onClick={() => handleExecuteAction(insight.id, p.id)}
                                    >
                                      {p.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Observação (Logs Comportamentais)</CardTitle>
              <CardDescription>
                Registro bruto de eventos e interações dos usuários com a plataforma (últimos 50
                eventos).
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Caminho</TableHead>
                    <TableHead>Data / Hora</TableHead>
                    <TableHead className="text-right">Metadados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Skeleton className="h-8 w-full max-w-sm mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        Nenhum registro comportamental encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {log.expand?.user?.name || log.expand?.user?.email || (
                            <span className="text-muted-foreground italic">Anônimo</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ACTION_TYPE_MAP[log.action_type] || log.action_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.path || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(log.created), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewLogMetadata(log.metadata)}
                            disabled={!log.metadata || Object.keys(log.metadata).length === 0}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Metadados do Evento</DialogTitle>
            <DialogDescription>Dados brutos associados à interação do usuário.</DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-4 rounded-md overflow-x-auto">
            <pre className="text-xs font-mono">
              {selectedLogData ? JSON.stringify(selectedLogData, null, 2) : 'Sem dados.'}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
