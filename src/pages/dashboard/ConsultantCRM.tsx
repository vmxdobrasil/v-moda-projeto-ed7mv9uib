import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { differenceInDays } from 'date-fns'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { OODAAgentDialog } from '@/components/crm/OODAAgentDialog'
import { Target, Users, DollarSign, Award } from 'lucide-react'

const CONS_STAGES = [
  { id: 'cons_potencial', label: 'Cliente em Potencial' },
  { id: 'cons_atendimento', label: 'Atendimento Realizado' },
  { id: 'cons_pedido', label: 'Pedido Fechado' },
  { id: 'cons_pagamento', label: 'Pagamento' },
  { id: 'cons_entrega', label: 'Entrega Concluída' },
]

function getAdaColor(dateStr: string) {
  if (!dateStr) return 'bg-gray-400'
  const diff = differenceInDays(new Date(), new Date(dateStr))
  if (diff <= 5) return 'bg-green-500'
  if (diff <= 10) return 'bg-yellow-500'
  return 'bg-red-500'
}

export default function ConsultantCRM() {
  const [stats, setStats] = useState({
    sales: 0,
    commissions: 0,
    activeClients: 0,
    rank: 'Fashion Consultant',
  })
  const [funnelItems, setFunnelItems] = useState<any[]>([])
  const [progress, setProgress] = useState(30)

  const loadData = async () => {
    try {
      if (!pb.authStore.record) return
      const me = await pb.collection('users').getOne(pb.authStore.record.id)
      const items = await pb
        .collection('customers')
        .getFullList({ filter: "status ~ 'cons_'", sort: '-updated' })
      setFunnelItems(items)

      const sales = items
        .filter((i) => i.status === 'cons_pedido')
        .reduce((a, b) => a + (b.estimated_value || 0), 0)

      setStats({
        sales: items.filter((i) => i.status === 'cons_pedido').length,
        commissions: sales * 0.1,
        activeClients: items.length,
        rank:
          me.segment_tier === 'premium_consultant'
            ? 'Premium'
            : me.segment_tier === 'exclusive_consultant'
              ? 'Exclusive'
              : 'Fashion Consultant',
      })

      let p = 30
      if (me.segment_tier === 'exclusive_consultant') p = 60
      if (me.segment_tier === 'premium_consultant') p = 100
      setProgress(p)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('customers', () => loadData())

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Consultant CRM</h1>
        <p className="text-muted-foreground">
          Gestão de Vendas, Carreira & ADA Visual para Consultoras
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendas Realizadas</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Comissões Estimadas</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.commissions)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Ativo</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients} clientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Seu Nível de Carreira</CardTitle>
            <Award className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600 mb-2">{stats.rank}</div>
            <Progress value={progress} className="h-2 bg-orange-100" />
            <div className="text-[10px] text-muted-foreground mt-1 flex justify-between uppercase font-semibold">
              <span>Standard</span>
              <span>Exclusive</span>
              <span>Premium</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-orange-100 shadow-sm">
        <CardHeader className="bg-orange-50/50 border-b">
          <CardTitle className="flex justify-between items-center text-orange-900">
            <span>Funil de Vendas (Singapura)</span>
            <OODAAgentDialog
              agent="career-mentor"
              contextId="all"
              contextType="consultant"
              prompt="Analise meu funil de vendas atual e sugira uma estratégia agressiva para eu atingir o próximo nível da minha carreira como consultora."
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 overflow-x-auto">
          <div className="flex gap-4 min-w-[1000px] h-[600px]">
            {CONS_STAGES.map((stage) => {
              const stageItems = funnelItems.filter((c) => c.status === stage.id)
              return (
                <div key={stage.id} className="flex-1 bg-muted/50 rounded-lg p-3 flex flex-col">
                  <h3 className="font-semibold mb-3 flex justify-between items-center text-sm">
                    {stage.label}
                    <Badge variant="secondary" className="bg-white">
                      {stageItems.length}
                    </Badge>
                  </h3>
                  <ScrollArea className="flex-1 -mx-1 px-1">
                    <div className="space-y-3 pb-4">
                      {stageItems.map((c) => (
                        <Card
                          key={c.id}
                          className="p-3 text-sm flex flex-col gap-2 border-l-4 border-l-orange-500 shadow-sm hover:border-l-orange-600 transition-colors"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-gray-800 line-clamp-1">
                              {c.name}
                            </span>
                            <div
                              className={`w-3 h-3 rounded-full shrink-0 mt-1 shadow-sm ${getAdaColor(c.updated)}`}
                              title="Indicador de Ação ADA"
                            />
                          </div>
                          <div className="font-bold text-green-700 mt-1 bg-green-50 px-2 py-1 rounded w-fit">
                            {formatCurrency(c.estimated_value)}
                          </div>
                          <OODAAgentDialog
                            agent="career-mentor"
                            contextId={c.id}
                            contextType="customer"
                            prompt={`Gere um script persuasivo de upsell no WhatsApp para a cliente ${c.name}.`}
                          />
                        </Card>
                      ))}
                      {stageItems.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-6 border border-dashed rounded-md bg-white/50">
                          Vazio
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
