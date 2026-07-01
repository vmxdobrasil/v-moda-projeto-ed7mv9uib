import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, MapPin, DollarSign, AlertCircle, MessageCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRealtime } from '@/hooks/use-realtime'
import { TierBadge } from '@/components/reseller/TierBadge'
import { format, subDays } from 'date-fns'

const STATES = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
}

export default function AdminResellers() {
  const [revendedoras, setRevendedoras] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [revs, ords] = await Promise.all([
        pb.collection('revendedoras').getFullList({ sort: '-created' }),
        pb
          .collection('pedidos_revenda')
          .getFullList({ sort: '-created', expand: 'revendedora,project' }),
      ])
      setRevendedoras(revs)
      setOrders(ords)
    } catch {
      /* */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('revendedoras', () => loadData())
  useRealtime('pedidos_revenda', () => loadData())

  const stateData = useMemo(() => {
    const map = new Map<string, any[]>()
    revendedoras.forEach((r) => {
      const st = (r.state || r.region || '').toUpperCase().trim()
      if (!st) return
      if (!map.has(st)) map.set(st, [])
      map.get(st)!.push(r)
    })
    return Array.from(map.entries())
      .map(([state, users]) => ({ state, users, count: users.length }))
      .sort((a, b) => b.count - a.count)
  }, [revendedoras])

  const maxCount = Math.max(...stateData.map((s) => s.count), 1)
  const inactiveResellers = useMemo(() => {
    const cutoff = subDays(new Date(), 30)
    return revendedoras.filter((r) => {
      const lastOrder = orders.find((o) => o.revendedora === r.id)
      if (!lastOrder) return r.status !== 'pending'
      return new Date(lastOrder.created) < cutoff
    })
  }, [revendedoras, orders])

  const totalCommissions = orders
    .filter((o) => o.status !== 'canceled')
    .reduce((acc, o) => acc + (o.profit || 0), 0)
  const pendingCommissions = orders
    .filter((o) => o.status === 'pending')
    .reduce((acc, o) => acc + (o.profit || 0), 0)
  const paidCommissions = orders
    .filter((o) => o.status === 'paid')
    .reduce((acc, o) => acc + (o.profit || 0), 0)

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const getIntensity = (count: number) => {
    const ratio = count / maxCount
    if (ratio > 0.75) return 'bg-electric text-white'
    if (ratio > 0.5) return 'bg-primary text-primary-foreground'
    if (ratio > 0.25) return 'bg-primary/60 text-primary-foreground'
    return 'bg-primary/20 text-primary'
  }

  return (
    <div className="space-y-6 animate-fade-in-up p-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Revendedoras Autônomas</h1>
        <p className="text-muted-foreground mt-2">
          Gestão da força de vendas direta e expansão nacional.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revendedoras</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revendedoras.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estados Ativos</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stateData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              R$ {pendingCommissions.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativas (30d)</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{inactiveResellers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="heatmap">
        <TabsList>
          <TabsTrigger value="heatmap">Distribuição</TabsTrigger>
          <TabsTrigger value="activation">Ativação</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Calor por Estado</CardTitle>
              <CardDescription>Densidade de revendedoras por unidade federativa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {stateData.map(({ state, count }) => (
                  <div
                    key={state}
                    className={`rounded-xl p-4 transition-all hover:scale-105 cursor-default ${getIntensity(count)}`}
                  >
                    <div className="text-xs font-bold uppercase">{state}</div>
                    <div className="text-lg font-bold mt-1">{count}</div>
                    <div className="text-[10px] opacity-80">
                      {STATES[state as keyof typeof STATES] || state}
                    </div>
                  </div>
                ))}
                {stateData.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Nenhuma revendedora com região cadastrada.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Ativação</CardTitle>
              <CardDescription>Revendedoras sem pedidos nos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {inactiveResellers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Todas as revendedoras estão ativas!
                  </p>
                ) : (
                  inactiveResellers.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.whatsapp} • {r.city || r.region || 'Sem região'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <TierBadge tier={r.tier} size="sm" />
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600/30 hover:bg-green-50"
                          onClick={() =>
                            window.open(
                              `https://wa.me/55${r.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Sentimos sua falta na V MODA. Que tal voltar a vender com a gente?')}`,
                              '_blank',
                            )
                          }
                        >
                          <MessageCircle className="w-3 h-3 mr-1" /> Reativar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total em Comissões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalCommissions.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pagas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {paidCommissions.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  R$ {pendingCommissions.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Revendedora</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum pedido registrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.slice(0, 50).map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">
                          {o.expand?.revendedora?.name || '-'}
                        </TableCell>
                        <TableCell>{o.expand?.project?.name || '-'}</TableCell>
                        <TableCell className="text-sm">
                          {o.created ? format(new Date(o.created), 'dd/MM/yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={o.status === 'paid' ? 'default' : 'secondary'}>
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          R$ {(o.profit || 0).toFixed(2)}
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
    </div>
  )
}
