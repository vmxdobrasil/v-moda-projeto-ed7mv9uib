import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Store, ShoppingBag, Truck, Heart } from 'lucide-react'
import { differenceInDays } from 'date-fns'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { OODAAgentDialog } from '@/components/crm/OODAAgentDialog'

const RETAIL_STAGES = [
  { id: 'retail_interesse', label: 'Interesse' },
  { id: 'retail_cotacao', label: 'Cotação' },
  { id: 'retail_pedido', label: 'Pedido Feito' },
  { id: 'retail_pagamento', label: 'Pagamento Confirmado' },
  { id: 'retail_entrega', label: 'Entrega' },
]

function getAdaColor(dateStr: string) {
  if (!dateStr) return 'bg-gray-400'
  const diff = differenceInDays(new Date(), new Date(dateStr))
  if (diff <= 7) return 'bg-green-500'
  if (diff <= 15) return 'bg-yellow-500'
  return 'bg-red-500'
}

export default function RetailCRM() {
  const [stats, setStats] = useState({ favs: 0, orders: 0, totalVal: 0, deliveries: 0 })
  const [funnelItems, setFunnelItems] = useState<any[]>([])
  const [exclusivityZone, setExclusivityZone] = useState('')

  const loadData = async () => {
    try {
      if (pb.authStore.record) {
        const me = await pb.collection('users').getOne(pb.authStore.record.id)
        setExclusivityZone(me.operating_regions || 'Geral')
      }

      const items = await pb.collection('customers').getFullList({
        filter: "status ~ 'retail_'",
        sort: '-updated',
      })
      setFunnelItems(items)

      setStats({
        favs: 12,
        orders: items.filter((i) => i.status === 'retail_pedido').length,
        totalVal: items.reduce((a, b) => a + (b.estimated_value || 0), 0),
        deliveries: items.filter((i) => i.status === 'retail_entrega').length,
      })
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Retail CRM</h1>
          <p className="text-muted-foreground">Sistema Singapura & ADA Integrado (Varejista)</p>
        </div>
        <div className="text-right">
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-200 bg-orange-50 text-sm px-3 py-1"
          >
            Zona de Exclusividade: {exclusivityZone}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Marcas Favoritas</CardTitle>
            <Heart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos do Mês</CardTitle>
            <ShoppingBag className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor em Compras</CardTitle>
            <Store className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.totalVal)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entregas Pendentes</CardTitle>
            <Truck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliveries}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-orange-100 shadow-sm">
        <CardHeader className="bg-orange-50/50 border-b">
          <CardTitle className="flex justify-between items-center text-orange-900">
            <span>Funil de Compras (Singapura)</span>
            <OODAAgentDialog
              agent="retail-strategist"
              contextId="all"
              contextType="retail"
              prompt="Analise meu funil de compras e sugira ações de reposição estratégica para minha loja."
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 overflow-x-auto">
          <div className="flex gap-4 min-w-[1000px] h-[600px]">
            {RETAIL_STAGES.map((stage) => {
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
                          className="p-3 text-sm flex flex-col gap-2 border-l-4 border-l-orange-500 shadow-sm relative hover:shadow-md transition-shadow"
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
                          <div className="text-muted-foreground text-xs">
                            {c.notes || 'Acompanhamento pendente...'}
                          </div>
                          <div className="font-bold text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded w-fit">
                            {formatCurrency(c.estimated_value)}
                          </div>
                          <OODAAgentDialog
                            agent="retail-strategist"
                            contextId={c.id}
                            contextType="customer"
                            prompt={`Analise a compra em andamento com a marca ${c.name} e sugira o próximo passo tático.`}
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
