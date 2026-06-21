import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { differenceInDays, format } from 'date-fns'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import {
  BrainCircuit,
  Loader2,
  Sparkles,
  Building2,
  Users,
  ShoppingCart,
  DollarSign,
  Calendar,
} from 'lucide-react'

const STAGES = [
  { id: 'lead', label: 'Lead' },
  { id: 'contact', label: 'Contato' },
  { id: 'proposal', label: 'Proposta Enviada' },
  { id: 'negotiating', label: 'Negociação' },
  { id: 'converted', label: 'Pedido Confirmado' },
]

const STAGE_MAPPING: Record<string, string> = {
  new: 'lead',
  lead: 'lead',
  contact: 'contact',
  interested: 'contact',
  proposal: 'proposal',
  qualified: 'proposal',
  negotiating: 'negotiating',
  negotiation: 'negotiating',
  converted: 'converted',
  closed: 'converted',
}

function getAdaColor(c: any) {
  const delivery = c.shipping_date ? new Date(c.shipping_date) : null
  const lastAction = c.last_action_date ? new Date(c.last_action_date) : new Date(c.updated)
  const now = new Date()

  const daysSinceAction = differenceInDays(now, lastAction)

  if (delivery) {
    const daysToDelivery = differenceInDays(delivery, now)
    if (daysToDelivery < 0) return 'bg-red-500'
    if (daysToDelivery >= 0 && daysToDelivery <= 3) return 'bg-yellow-500'
  }

  if (daysSinceAction > 7) return 'bg-red-500'
  if (daysSinceAction >= 3 && daysSinceAction <= 7) return 'bg-yellow-500'

  return 'bg-green-500'
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

export default function ManufacturerCRM() {
  const { toast } = useToast()
  const [metrics, setMetrics] = useState({
    activeRetailers: 0,
    linkedConsultants: 0,
    monthlyOrders: 0,
    revenue: 0,
  })
  const [pipeline, setPipeline] = useState<any[]>([])
  const [oodaAnalysis, setOodaAnalysis] = useState('')
  const [analyzingOoda, setAnalyzingOoda] = useState(false)
  const [cardAi, setCardAi] = useState<Record<string, string>>({})
  const [loadingCardAi, setLoadingCardAi] = useState<Record<string, boolean>>({})

  const loadPipeline = async () => {
    try {
      const authId = pb.authStore.record?.id
      if (!authId) return

      const customers = await pb.collection('customers').getFullList({
        filter: `manufacturer = "${authId}"`,
        sort: '-updated',
      })
      setPipeline(customers)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const authId = pb.authStore.record?.id
        if (!authId) return

        const customers = await pb.collection('customers').getFullList({
          filter: `manufacturer = "${authId}"`,
          expand: 'affiliate_referrer',
        })

        const activeRet = customers.filter((c) =>
          ['converted', 'negotiating'].includes(c.status),
        ).length
        const linkedCons = new Set(
          customers
            .filter((c) => c.expand?.affiliate_referrer?.segment_tier?.includes('consultant'))
            .map((c) => c.affiliate_referrer),
        ).size

        const firstDay = new Date()
        firstDay.setDate(1)
        firstDay.setHours(0, 0, 0, 0)

        const transactions = await pb.collection('v_club_transactions').getFullList({
          filter: `store = "${authId}" && created >= "${firstDay.toISOString()}" && status = "approved"`,
        })

        const orders = transactions.length
        const revenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)

        setMetrics({
          activeRetailers: activeRet,
          linkedConsultants: linkedCons,
          monthlyOrders: orders,
          revenue,
        })
      } catch (e) {
        console.error(e)
      }
    }

    fetchMetrics()
    loadPipeline()
  }, [])

  const handleDragStart = (e: React.DragEvent, customerId: string) => {
    e.dataTransfer.setData('customerId', customerId)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const customerId = e.dataTransfer.getData('customerId')
    if (!customerId) return

    try {
      const customer = pipeline.find((c) => c.id === customerId)
      if (STAGE_MAPPING[customer?.status || ''] === newStatus) return

      await pb.collection('customers').update(customerId, {
        status: newStatus,
        last_action_date: new Date().toISOString(),
      })

      toast({ title: 'Status atualizado com sucesso' })
      loadPipeline()
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  const analyzePipeline = async () => {
    setAnalyzingOoda(true)
    try {
      const res = await pb.send('/backend/v1/ooda-pipeline-analysis', {
        method: 'POST',
        body: { pipeline },
      })
      setOodaAnalysis(res.suggestion)
    } catch (e) {
      console.error(e)
      toast({ title: 'Erro ao analisar funil', variant: 'destructive' })
    } finally {
      setAnalyzingOoda(false)
    }
  }

  const analyzeCard = async (customer: any) => {
    setLoadingCardAi((prev) => ({ ...prev, [customer.id]: true }))
    try {
      const res = await pb.send('/backend/v1/ooda-card-analysis', {
        method: 'POST',
        body: { customer },
      })
      setCardAi((prev) => ({ ...prev, [customer.id]: res.suggestion }))
    } catch (e) {
      console.error(e)
      toast({ title: 'Erro ao obter dica da IA', variant: 'destructive' })
    } finally {
      setLoadingCardAi((prev) => ({ ...prev, [customer.id]: false }))
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="bg-orange-500 text-white px-4 py-3 rounded-md flex items-center justify-center gap-2 font-medium mb-6 shadow-sm">
        <Sparkles className="h-5 w-5" />
        Marcas do TOP 60 são escolhidas pela curadoria da Revista Moda Atual e da plataforma V MODA
        BRASIL
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lojistas Ativos</CardTitle>
            <Building2 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeRetailers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consultoras Vinculadas</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.linkedConsultants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos no Mês</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.monthlyOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.revenue)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-orange-200 dark:border-orange-900/50 shadow-sm">
        <CardHeader className="bg-orange-50/50 dark:bg-orange-950/20 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-lg">Assistente Estratégico OODA</CardTitle>
            </div>
            <Button
              onClick={analyzePipeline}
              disabled={analyzingOoda}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {analyzingOoda && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Analisar Funil
            </Button>
          </div>
          <CardDescription>
            Observa o fluxo de vendas, orienta a priorização e sugere a próxima ação tática.
          </CardDescription>
        </CardHeader>
        {oodaAnalysis && (
          <CardContent className="pt-4">
            <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-md border border-orange-100 dark:border-orange-900/50 text-sm whitespace-pre-wrap leading-relaxed text-orange-900 dark:text-orange-100">
              {oodaAnalysis}
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageCustomers = pipeline.filter((c) => STAGE_MAPPING[c.status] === stage.id)
          return (
            <div
              key={stage.id}
              className="flex-1 min-w-[280px] bg-muted/30 rounded-lg p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <h3 className="font-semibold mb-3 flex items-center justify-between text-orange-900 dark:text-orange-100 text-sm">
                {stage.label}
                <Badge className="bg-orange-500">{stageCustomers.length}</Badge>
              </h3>
              <div className="space-y-3">
                {stageCustomers.map((c) => (
                  <Card
                    key={c.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, c.id)}
                    className="cursor-move border-l-4 border-l-orange-500 hover:shadow-md transition-all"
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm line-clamp-1 flex-1 pr-2">{c.name}</div>
                        <div
                          className={`w-3 h-3 rounded-full shrink-0 mt-1 ${getAdaColor(c)}`}
                          title="Indicador ADA"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <DollarSign className="w-3 h-3" /> {formatCurrency(c.estimated_value)}
                      </div>
                      {c.shipping_date && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                          <Calendar className="w-3 h-3" />{' '}
                          {format(new Date(c.shipping_date), 'dd/MM/yyyy')}
                        </div>
                      )}

                      {cardAi[c.id] ? (
                        <div className="mt-2 text-xs bg-orange-50 dark:bg-orange-950/30 p-2 rounded border border-orange-200 dark:border-orange-900 text-orange-800 dark:text-orange-200">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {cardAi[c.id]}
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs h-7 text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/50 mt-2"
                          onClick={() => analyzeCard(c)}
                          disabled={loadingCardAi[c.id]}
                        >
                          {loadingCardAi[c.id] ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <BrainCircuit className="w-3 h-3 mr-1" />
                          )}
                          Dica IA
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
