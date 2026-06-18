import { useState, useEffect } from 'react'
import {
  getCustomers,
  updateCustomer,
  type Customer,
  type CustomerStatus,
} from '@/services/customers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { Sparkles, Clock, AlertTriangle, Loader2, TrendingUp, Target, Trophy } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

const COLUMNS: { id: CustomerStatus; label: string }[] = [
  { id: 'new', label: 'Prospecção' },
  { id: 'interested', label: 'Contato' },
  { id: 'proposal', label: 'Proposta' },
  { id: 'negotiating', label: 'Negociação' },
  { id: 'converted', label: 'Fechado' },
]

export default function SalesMachine() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Record<string, string>>({})

  const loadData = async () => {
    try {
      const data = await pb.collection('customers').getFullList<Customer>({
        sort: '-updated',
        expand: 'manufacturer,affiliate_referrer',
      })
      setCustomers(data)
    } catch (err) {
      toast.error('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', () => {
    loadData()
  })

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('customerId', id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, status: CustomerStatus) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('customerId')
    if (!id) return

    const customer = customers.find((c) => c.id === id)
    if (customer && customer.status !== status) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status, last_action_date: new Date().toISOString() } : c,
        ),
      )

      try {
        await updateCustomer(id, {
          status,
          last_action_date: new Date().toISOString(),
        })
        toast.success('Lead movido com sucesso!')
      } catch (error) {
        toast.error('Erro ao mover lead')
        loadData()
      }
    }
  }

  const getOodaAlert = (customer: Customer) => {
    if (customer.status === 'converted' || customer.status === 'inactive') return null

    const dateStr = customer.last_action_date || customer.updated
    if (!dateStr) return null

    const hours = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60)
    if (hours > 72) return { level: 'red', text: 'Estagnado > 72h' }
    if (hours > 48) return { level: 'yellow', text: 'Sem ação > 48h' }
    return null
  }

  const getSuggestion = async (customerId: string) => {
    setAiLoading(customerId)
    try {
      const res = await pb.send('/backend/v1/sales-copilot/suggest', {
        method: 'POST',
        body: JSON.stringify({ customer_id: customerId }),
      })
      setSuggestions((prev) => ({ ...prev, [customerId]: res.suggestion }))
    } catch (err) {
      toast.error('Erro ao obter sugestão da IA')
    } finally {
      setAiLoading(null)
    }
  }

  const performanceStats = () => {
    const sellerStats = new Map<string, { name: string; sales: number; activeLeads: number }>()
    let currentMonthSales = 0

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    customers.forEach((c) => {
      const seller = c.expand?.affiliate_referrer || c.expand?.manufacturer
      if (seller) {
        if (!sellerStats.has(seller.id)) {
          sellerStats.set(seller.id, {
            name: seller.name || seller.email || 'Desconhecido',
            sales: 0,
            activeLeads: 0,
          })
        }
        const stat = sellerStats.get(seller.id)!

        if (c.status === 'converted') {
          stat.sales += 1

          const convDate = new Date(c.last_action_date || c.updated)
          if (convDate.getMonth() === currentMonth && convDate.getFullYear() === currentYear) {
            currentMonthSales += 1
          }
        } else if (c.status !== 'inactive') {
          stat.activeLeads += 1
        }
      }
    })

    const ranking = Array.from(sellerStats.values()).sort((a, b) => b.sales - a.sales)
    return { ranking, currentMonthSales }
  }

  const { ranking, currentMonthSales } = performanceStats()
  const monthlyGoal = 50
  const goalProgress = Math.min((currentMonthSales / monthlyGoal) * 100, 100)

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Máquina de Vendas</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seu funil de vendas, identifique gargalos e feche mais negócios com IA.
        </p>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="pipeline">Pipeline OODA</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-6">
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {COLUMNS.map((col) => {
              const colCustomers = customers.filter((c) => c.status === col.id)
              return (
                <div
                  key={col.id}
                  className="flex-shrink-0 w-[320px] bg-muted/30 rounded-xl border p-4 flex flex-col min-h-[500px]"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">{col.label}</h3>
                    <Badge variant="secondary">{colCustomers.length}</Badge>
                  </div>
                  <div className="flex-1 space-y-3">
                    {colCustomers.map((customer) => {
                      const alert = getOodaAlert(customer)
                      return (
                        <Card
                          key={customer.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, customer.id)}
                          className={cn(
                            'cursor-grab active:cursor-grabbing border-l-4 transition-all hover:shadow-md',
                            alert?.level === 'red'
                              ? 'border-l-red-500'
                              : alert?.level === 'yellow'
                                ? 'border-l-yellow-500'
                                : 'border-l-transparent',
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium text-sm truncate pr-2">
                                {customer.name}
                              </div>
                              {customer.ranking_category && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] h-5 px-1 whitespace-nowrap"
                                >
                                  {customer.ranking_category.split('_')[1] || 'Geral'}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                              <span className="truncate max-w-[120px]">
                                {customer.city || 'Cidade N/A'}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(
                                  customer.last_action_date || customer.updated,
                                ).toLocaleDateString()}
                              </span>
                            </div>

                            {alert && (
                              <div
                                className={cn(
                                  'flex items-center gap-1 text-xs font-medium mb-3',
                                  alert.level === 'red' ? 'text-red-600' : 'text-yellow-600',
                                )}
                              >
                                <AlertTriangle className="w-3 h-3" />
                                {alert.text}
                              </div>
                            )}

                            {suggestions[customer.id] ? (
                              <div className="mt-2 p-3 bg-primary/5 rounded border border-primary/10 text-xs text-primary/90">
                                <div className="flex items-center gap-1 font-semibold mb-2">
                                  <Sparkles className="w-3 h-3" /> Sugestão de Ação:
                                </div>
                                <div className="leading-relaxed">{suggestions[customer.id]}</div>
                              </div>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full text-xs h-8 bg-primary/5 text-primary hover:bg-primary/10 border-0 mt-1"
                                onClick={() => getSuggestion(customer.id)}
                                disabled={aiLoading === customer.id}
                              >
                                {aiLoading === customer.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                ) : (
                                  <Sparkles className="w-3 h-3 mr-1" />
                                )}
                                Melhor Próxima Ação
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                    {colCustomers.length === 0 && (
                      <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                        Arraste leads para cá
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Meta do Mês
                </CardTitle>
                <CardDescription>Acompanhamento de conversões no mês atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between mb-2">
                  <div className="text-4xl font-bold">{currentMonthSales}</div>
                  <div className="text-sm text-muted-foreground mb-1">
                    de {monthlyGoal} fechamentos
                  </div>
                </div>
                <Progress value={goalProgress} className="h-3 mt-4" />
                <p className="text-sm text-muted-foreground mt-4">
                  {goalProgress >= 100
                    ? '🎉 Meta atingida! Excelente trabalho.'
                    : `Faltam ${monthlyGoal - currentMonthSales} fechamentos para bater a meta.`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Ranking de Vendedores
                </CardTitle>
                <CardDescription>Performance baseada em conversões totais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ranking.slice(0, 5).map((seller, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                            index === 0
                              ? 'bg-yellow-500 text-white shadow-sm'
                              : index === 1
                                ? 'bg-slate-300 text-slate-700 shadow-sm'
                                : index === 2
                                  ? 'bg-amber-700 text-white shadow-sm'
                                  : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{seller.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {seller.activeLeads} leads ativos no funil
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{seller.sales}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          Vendas
                        </div>
                      </div>
                    </div>
                  ))}
                  {ranking.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma venda registrada.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
