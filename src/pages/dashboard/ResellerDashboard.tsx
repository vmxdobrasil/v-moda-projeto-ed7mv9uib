import { useEffect, useState, useMemo } from 'react'
import { ShoppingBag, TrendingUp, Users, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { TierBadge } from '@/components/reseller/TierBadge'
import { PointsProgress } from '@/components/reseller/PointsProgress'
import { CreateOrderDialog } from '@/components/reseller/CreateOrderDialog'
import { ShareCatalogDialog } from '@/components/reseller/ShareCatalogDialog'
import {
  getRevendedoraByUser,
  getDownline,
  getHistoricoPontos,
  getNiveisRevenda,
  type Revendedora,
  type NivelRevenda,
} from '@/services/revendedoras'
import { getPedidosByRevendedora, type PedidoRevenda } from '@/services/pedidos-revenda'
import { format } from 'date-fns'

export default function ResellerDashboard() {
  const { user } = useAuth()
  const [revendedora, setRevendedora] = useState<Revendedora | null>(null)
  const [niveis, setNiveis] = useState<NivelRevenda[]>([])
  const [orders, setOrders] = useState<PedidoRevenda[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [downline, setDownline] = useState<Revendedora[]>([])
  const [pointsHistory, setPointsHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!user) return
    try {
      const rev = await getRevendedoraByUser(user.id)
      setRevendedora(rev)
      const [n, o, p, d, h] = await Promise.all([
        getNiveisRevenda(),
        getPedidosByRevendedora(rev.id),
        pb
          .collection('projects')
          .getList(1, 50, { filter: 'stock_quantity > 0', sort: '-created' })
          .then((r) => r.items)
          .catch(() => []),
        getDownline(rev.id),
        getHistoricoPontos(rev.id),
      ])
      setNiveis(n)
      setOrders(o)
      setProducts(p)
      setDownline(d)
      setPointsHistory(h)
    } catch {
      /* not a revendedora yet */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])
  useRealtime('pedidos_revenda', () => loadData())
  useRealtime('historico_pontos_revenda', () => loadData())

  const monthlyProfit = useMemo(() => {
    const now = new Date()
    return orders
      .filter((o) => {
        const d = new Date(o.created)
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear() &&
          o.status !== 'canceled'
        )
      })
      .reduce((acc, o) => acc + (o.profit || 0), 0)
  }, [orders])

  const nextNivel = niveis.find((n) => n.min_points > (revendedora?.total_points || 0))

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!revendedora) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
        <Award className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Você ainda não é uma revendedora cadastrada.</p>
        <a href="/empreenda" className="text-primary hover:underline font-medium">
          Quero empreender com a V MODA
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy">
            Olá, {revendedora.name.split(' ')[0]}!
          </h1>
          <div className="mt-2">
            <TierBadge tier={revendedora.tier} size="md" />
          </div>
        </div>
        <div className="flex gap-2">
          <ShareCatalogDialog resellerCode={revendedora.id.slice(0, 8)} products={products} />
          <CreateOrderDialog revendedoraId={revendedora.id} products={products} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Lucro do Mês</span>
            </div>
            <div className="text-lg font-bold text-green-600">R$ {monthlyProfit.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs">Pontos V MODA</span>
            </div>
            <div className="text-lg font-bold">
              {(revendedora.total_points || 0).toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs">Pedidos</span>
            </div>
            <div className="text-lg font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Minha Rede</span>
            </div>
            <div className="text-lg font-bold">{downline.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <PointsProgress
            currentPoints={revendedora.total_points || 0}
            currentTier={revendedora.tier}
            nextTier={nextNivel?.name || null}
            nextTierMinPoints={nextNivel?.min_points || 0}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="orders">
        <TabsList className="w-full">
          <TabsTrigger value="orders" className="flex-1">
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="network" className="flex-1">
            Minha Rede
          </TabsTrigger>
          <TabsTrigger value="points" className="flex-1">
            Pontos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-2">
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum pedido ainda. Crie seu primeiro pedido!
            </p>
          ) : (
            orders.map((o) => (
              <Card key={o.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{o.expand?.project?.name || 'Produto'}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(o.created), 'dd/MM/yyyy')} •{' '}
                      {o.type === 'wholesale' ? 'Atacado' : 'Dropshipping'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">R$ {(o.total_amount || 0).toFixed(2)}</p>
                    <Badge
                      variant={o.status === 'paid' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {o.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="network" className="space-y-2">
          {downline.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma indicação ainda. Compartilhe seu link!
            </p>
          ) : (
            downline.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.city || d.region}</p>
                  </div>
                  <TierBadge tier={d.tier} size="sm" />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="points" className="space-y-2">
          {pointsHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum ponto registrado ainda.</p>
          ) : (
            pointsHistory.map((h) => (
              <Card key={h.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{h.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(h.created), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <span
                    className={
                      h.type === 'earned' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'
                    }
                  >
                    {h.type === 'earned' ? '+' : '-'}
                    {h.points}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
