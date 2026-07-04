import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, Store, ShoppingBag, Share2, AlertCircle, RefreshCw } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'

export default function CRMHub() {
  const [leadsVenda, setLeadsVenda] = useState<any[]>([])
  const [leadsFab, setLeadsFab] = useState<any[]>([])
  const [leadsRet, setLeadsRet] = useState<any[]>([])
  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setError(null)
    try {
      const [venda, fab, ret, refs] = await Promise.all([
        pb
          .collection('leads_venda')
          .getFullList({ sort: '-created', expand: 'retailer,manufacturer,brand' })
          .catch(() => []),
        pb
          .collection('leads_fabricantes')
          .getFullList({ sort: '-created' })
          .catch(() => []),
        pb
          .collection('leads_retailers')
          .getFullList({ sort: '-created' })
          .catch(() => []),
        pb
          .collection('referrals')
          .getFullList({ sort: '-created', expand: 'affiliate,brand' })
          .catch(() => []),
      ])
      setLeadsVenda(venda)
      setLeadsFab(fab)
      setLeadsRet(ret)
      setReferrals(refs)
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        setError('Acesso negado. Você não tem permissão para visualizar estes dados.')
      } else if (err?.status === 0) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.')
      } else {
        setError('Não foi possível carregar os dados. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('leads_venda', loadData)
  useRealtime('referrals', loadData)

  const stats = [
    { label: 'Leads de Venda', value: leadsVenda.length, icon: ShoppingBag, color: 'text-primary' },
    { label: 'Leads Fabricantes', value: leadsFab.length, icon: Store, color: 'text-azul' },
    { label: 'Leads Lojistas', value: leadsRet.length, icon: Users, color: 'text-emerald' },
    { label: 'Indicações', value: referrals.length, icon: Share2, color: 'text-electric' },
  ]

  const statusBadge = (status: string) => (
    <Badge
      variant={
        status === 'converted' || status === 'approved'
          ? 'default'
          : status === 'pending'
            ? 'secondary'
            : 'outline'
      }
    >
      {status}
    </Badge>
  )

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 animate-fade-in">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-destructive font-medium">{error}</p>
        <Button variant="outline" size="sm" onClick={() => loadData()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display">CRM Hub</h1>
        <p className="text-muted-foreground mt-1">
          Gestão centralizada de leads, indicações e performance de afiliados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="fashion-tech-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-display">{s.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="venda" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto">
          <TabsTrigger value="venda">Leads de Venda</TabsTrigger>
          <TabsTrigger value="fabricantes">Fabricantes</TabsTrigger>
          <TabsTrigger value="retailers">Lojistas</TabsTrigger>
          <TabsTrigger value="referrals">Indicações</TabsTrigger>
        </TabsList>

        <TabsContent value="venda">
          <Card className="fashion-tech-card">
            <CardHeader>
              <CardTitle className="font-display">Leads de Venda</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Revendedor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadsVenda.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">
                        {l.expand?.retailer?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{statusBadge(l.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(l.created).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {leadsVenda.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        Nenhum lead.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fabricantes">
          <Card className="fashion-tech-card">
            <CardHeader>
              <CardTitle className="font-display">Leads de Fabricantes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Marca</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadsFab.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell>{l.category}</TableCell>
                      <TableCell>{statusBadge(l.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(l.created).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {leadsFab.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhum lead.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retailers">
          <Card className="fashion-tech-card">
            <CardHeader>
              <CardTitle className="font-display">Leads de Lojistas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loja</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadsRet.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.store_name}</TableCell>
                      <TableCell>
                        {l.city}/{l.state}
                      </TableCell>
                      <TableCell>{statusBadge(l.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(l.created).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {leadsRet.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhum lead.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <Card className="fashion-tech-card">
            <CardHeader>
              <CardTitle className="font-display">Indicações de Afiliados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Afiliado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.expand?.affiliate?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.source_channel || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(r.created).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {referrals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhuma indicação.
                      </TableCell>
                    </TableRow>
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
