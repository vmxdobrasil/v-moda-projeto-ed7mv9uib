import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import {
  getMarketInsights,
  updateMarketInsight,
  type MarketInsight,
} from '@/services/market_insights'
import { createActionExecution } from '@/services/action_executions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Zap,
  Filter,
} from 'lucide-react'

const TYPE_MAP = {
  low_conversion: {
    label: 'Baixa Conversão',
    icon: TrendingDown,
    color: 'text-orange-500 bg-orange-500/10',
  },
  stock_out_risk: {
    label: 'Risco de Ruptura',
    icon: AlertTriangle,
    color: 'text-red-500 bg-red-500/10',
  },
  trending_up: { label: 'Em Alta', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10' },
  performance_alert: {
    label: 'Alerta de Performance',
    icon: Activity,
    color: 'text-blue-500 bg-blue-500/10',
  },
}

export default function AdminInsights() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [insights, setInsights] = useState<MarketInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending')
  const [selectedInsight, setSelectedInsight] = useState<MarketInsight | null>(null)
  const [provider, setProvider] = useState<string>('whatsapp_evolution')
  const [actionLoading, setActionLoading] = useState(false)

  const loadData = async () => {
    try {
      const data = await getMarketInsights()
      setInsights(data)
    } catch (e) {
      toast({ title: 'Erro ao carregar insights', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('market_insights', loadData)

  const handleResolve = async (id: string) => {
    try {
      await updateMarketInsight(id, { is_resolved: true })
      toast({ title: 'Insight marcado como resolvido' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao resolver', variant: 'destructive' })
    }
  }

  const handleExecute = async () => {
    if (!selectedInsight || !user) return
    setActionLoading(true)
    try {
      await createActionExecution({
        insight: selectedInsight.id,
        admin_user: user.id,
        service_provider: provider as any,
        status: 'pending',
      })
      toast({ title: 'Ação agendada com sucesso' })
      setSelectedInsight(null)
    } catch (e) {
      toast({ title: 'Erro ao executar ação', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = insights.filter((i) => {
    if (filter === 'pending') return !i.is_resolved
    if (filter === 'resolved') return i.is_resolved
    return true
  })

  const kpis = {
    active: insights.filter((i) => !i.is_resolved).length,
    stock: insights.filter((i) => !i.is_resolved && i.insight_type === 'stock_out_risk').length,
    lowConv: insights.filter((i) => !i.is_resolved && i.insight_type === 'low_conversion').length,
    trending: insights.filter((i) => !i.is_resolved && i.insight_type === 'trending_up').length,
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Insights & Inteligência</h1>
        <p className="text-muted-foreground">
          Monitore tendências de mercado e execute ações estratégicas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Risco de Ruptura</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.stock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Baixa Conversão</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.lowConv}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Alta</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.trending}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Insights</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Sugestão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum insight encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((insight) => {
                const typeInfo = TYPE_MAP[insight.insight_type]
                const Icon = typeInfo.icon
                return (
                  <TableRow key={insight.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${typeInfo.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium whitespace-nowrap">{typeInfo.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="capitalize text-sm font-medium">
                          {insight.entity_type}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {insight.entity_id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{insight.score?.toFixed(1) || '-'}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={insight.suggested_action}>
                      {insight.suggested_action || '-'}
                    </TableCell>
                    <TableCell>
                      {insight.is_resolved ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none border-0">
                          Resolvido
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 shadow-none border-0">
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!insight.is_resolved && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolve(insight.id)}
                              className="h-8 hidden md:flex"
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Resolver
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setSelectedInsight(insight)}
                              className="h-8"
                            >
                              <Zap className="mr-1 h-3 w-3" /> Agir
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedInsight} onOpenChange={(o) => !o && setSelectedInsight(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Executar Ação</DialogTitle>
            <DialogDescription>
              Escolha o canal para disparar a ação automatizada.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o provedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp_evolution">WhatsApp (Evolution API)</SelectItem>
                <SelectItem value="email">Email Marketing</SelectItem>
                <SelectItem value="firebase_fcm">Push Notification (FCM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInsight(null)}>
              Cancelar
            </Button>
            <Button onClick={handleExecute} disabled={actionLoading}>
              {actionLoading ? 'Executando...' : 'Confirmar Ação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
