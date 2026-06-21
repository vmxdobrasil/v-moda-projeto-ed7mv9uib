import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { differenceInDays } from 'date-fns'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { OODAAgentDialog } from '@/components/crm/OODAAgentDialog'
import { Package, TrendingUp, AlertCircle, ShoppingCart } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const MGMT_STAGES = [
  { id: 'mgmt_interesse', label: 'Interesse' },
  { id: 'mgmt_proposta', label: 'Proposta' },
  { id: 'mgmt_negociacao', label: 'Negociação' },
  { id: 'mgmt_fechamento', label: 'Fechamento' },
  { id: 'mgmt_pos_venda', label: 'Pós-venda' },
]

function getAdaColor(dateStr: string) {
  if (!dateStr) return 'bg-gray-400'
  const diff = differenceInDays(new Date(), new Date(dateStr))
  if (diff <= 7) return 'bg-green-500'
  if (diff <= 15) return 'bg-yellow-500'
  return 'bg-red-500'
}

export default function InventoryManagement() {
  const [stats, setStats] = useState({ totalStock: 0, sales: 0, topSellers: 0, alerts: 0 })
  const [funnelItems, setFunnelItems] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const items = await pb
        .collection('customers')
        .getFullList({ filter: "status ~ 'mgmt_'", sort: '-updated' })
      setFunnelItems(items)

      const projs = await pb.collection('projects').getFullList({ sort: '-created' })
      setProjects(projs)

      const lowStock = projs.filter((p) => p.stock_quantity < 10).length
      const totalStock = projs.reduce((a, b) => a + (b.stock_quantity || 0), 0)

      setStats({
        totalStock,
        sales: 45,
        topSellers: 3,
        alerts: lowStock,
      })
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('customers', () => loadData())
  useRealtime('projects', () => loadData())

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const updateStock = async (id: string, current: number, amount: number) => {
    try {
      await pb.collection('projects').update(id, { stock_quantity: Math.max(0, current + amount) })
      toast({ title: 'Estoque atualizado com sucesso' })
    } catch (e) {
      toast({ title: 'Erro ao atualizar estoque', variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Gestão de Vendas & Estoque
        </h1>
        <p className="text-muted-foreground">
          Controle integrado, OODA AI e Singapura Pipeline para Fabricantes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStock} un</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendas B2B (Mês)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sales} negócios</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos Premium</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topSellers} destaques</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Reposição</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.alerts} críticos</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <Card className="border-orange-100 shadow-sm flex flex-col h-[700px]">
          <CardHeader className="bg-orange-50/50 border-b shrink-0">
            <CardTitle className="flex justify-between items-center text-orange-900">
              <span>Funil de Vendas B2B</span>
              <OODAAgentDialog
                agent="inventory-manager"
                contextId="all"
                contextType="sales"
                prompt="Revise todos os leads no funil de vendas B2B e aponte quais devem receber maior prioridade estratégica de fechamento hoje."
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 overflow-x-auto flex-1">
            <div className="flex gap-4 min-w-[800px] h-full">
              {MGMT_STAGES.map((stage) => {
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
                            <div className="font-bold text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded w-fit">
                              {formatCurrency(c.estimated_value)}
                            </div>
                            <OODAAgentDialog
                              agent="inventory-manager"
                              contextId={c.id}
                              contextType="customer"
                              prompt={`Gere uma tática de negociação B2B infalível para acelerar o fechamento com o lead ${c.name}.`}
                            />
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm flex flex-col h-[700px]">
          <CardHeader className="bg-orange-50/50 border-b shrink-0">
            <CardTitle className="flex justify-between items-center text-orange-900">
              <span>Controle de Estoque Ativo</span>
              <OODAAgentDialog
                agent="inventory-manager"
                contextId="stock"
                contextType="inventory"
                prompt="Analise meu catálogo de produtos atual e sugira reajustes de preço dinâmicos baseados na quantidade em estoque."
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader className="bg-white sticky top-0 z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="pl-6">Produto</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead className="text-right pr-6">Ação Rápida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="pl-6 font-semibold text-gray-800">{p.name}</TableCell>
                      <TableCell className="text-gray-600">{formatCurrency(p.price)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={p.stock_quantity < 10 ? 'destructive' : 'secondary'}
                          className={
                            p.stock_quantity >= 10
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : ''
                          }
                        >
                          {p.stock_quantity || 0} un
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 space-x-2 whitespace-nowrap">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          onClick={() => updateStock(p.id, p.stock_quantity || 0, -1)}
                        >
                          -
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                          onClick={() => updateStock(p.id, p.stock_quantity || 0, 1)}
                        >
                          +
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {projects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum produto cadastrado no momento.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
