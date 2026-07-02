import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Check, X, Plus, Trash2, TrendingUp } from 'lucide-react'
import { RecordModel } from 'pocketbase'
import {
  getCampanhas,
  createCampanha,
  deleteCampanha,
  type CampanhaInfluencer,
} from '@/services/campanhas-influencer'

function genAffiliateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export default function AdminInfluencers() {
  const { toast } = useToast()
  const [pending, setPending] = useState<RecordModel[]>([])
  const [allInfluencers, setAllInfluencers] = useState<RecordModel[]>([])
  const [campanhas, setCampanhas] = useState<CampanhaInfluencer[]>([])
  const [loading, setLoading] = useState(true)

  const [newCoupon, setNewCoupon] = useState({
    affiliate: '',
    coupon_code: '',
    discount_percent: 10,
  })

  const loadData = async () => {
    try {
      const [pendingList, allList] = await Promise.all([
        pb.collection('users').getFullList({
          filter: 'role = "affiliate" && approval_status = "pending"',
          sort: '-created',
        }),
        pb.collection('users').getFullList({ filter: 'role = "affiliate"', sort: '-created' }),
      ])
      setPending(pendingList)
      setAllInfluencers(allList)
      const camps = await getCampanhas()
      setCampanhas(camps)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('users', () => loadData())

  const handleApprove = async (id: string) => {
    try {
      const user = allInfluencers.find((u) => u.id === id)
      const updateData: any = { approval_status: 'approved' }
      if (!user?.affiliate_code) {
        updateData.affiliate_code = genAffiliateCode()
      }
      await pb.collection('users').update(id, updateData)
      toast({ title: 'Influenciador aprovado!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDeny = async (id: string) => {
    try {
      await pb.collection('users').update(id, { approval_status: 'denied' })
      toast({ title: 'Influenciador rejeitado.' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCampanha(newCoupon)
      setNewCoupon({ affiliate: '', coupon_code: '', discount_percent: 10 })
      toast({ title: 'Cupom criado!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    try {
      await deleteCampanha(id)
      toast({ title: 'Cupom removido' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-navy">Gestão de Influenciadores</h1>
        <p className="text-muted-foreground mt-1">
          Aprove cadastros, monitore performance e gerencie cupons.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Aprovações ({pending.length})</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="coupons">Cupons</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Instagram</TableHead>
                    <TableHead>Nicho</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : pending.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        Nenhuma aprovação pendente.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pending.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.instagram_handle || u.instagram || '-'}</TableCell>
                        <TableCell>{u.niche || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleApprove(u.id)}>
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeny(u.id)}>
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Top Influenciadores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Comissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allInfluencers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>
                        <Badge variant={u.approval_status === 'approved' ? 'default' : 'secondary'}>
                          {u.approval_status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{u.affiliate_code || '-'}</TableCell>
                      <TableCell>{u.commission_rate || 1}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" /> Novo Cupom
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCoupon} className="grid gap-3 md:grid-cols-4 items-end">
                <div className="space-y-2">
                  <Label>Afiliado (ID)</Label>
                  <Input
                    value={newCoupon.affiliate}
                    onChange={(e) => setNewCoupon({ ...newCoupon, affiliate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input
                    value={newCoupon.coupon_code}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, coupon_code: e.target.value.toUpperCase() })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Desconto (%)</Label>
                  <Input
                    type="number"
                    value={newCoupon.discount_percent}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, discount_percent: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-electric hover:bg-electric/90 text-electric-foreground"
                >
                  Criar
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campanhas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        Nenhum cupom criado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    campanhas.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono font-bold">{c.coupon_code}</TableCell>
                        <TableCell>{c.discount_percent}%</TableCell>
                        <TableCell>
                          <Badge variant={c.is_active ? 'default' : 'secondary'}>
                            {c.is_active ? 'Sim' : 'Não'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCoupon(c.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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
    </div>
  )
}
