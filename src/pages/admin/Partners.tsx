import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, ShieldAlert, Edit2, Percent, CheckCircle, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { useRealtime } from '@/hooks/use-realtime'

export default function AdminPartners({ defaultTab = 'affiliate' }: { defaultTab?: string }) {
  const [users, setUsers] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [pendingRefs, setPendingRefs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [editUser, setEditUser] = useState<any>(null)
  const [editData, setEditData] = useState({ role: '', rate: '1.0', isVerified: false })
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [uRes, lRes, rRes] = await Promise.all([
        pb
          .collection('users')
          .getFullList({ filter: 'role="affiliate" || role="agent"', sort: '-created' }),
        pb
          .collection('commission_audit_logs')
          .getFullList({ sort: '-created', expand: 'admin_user,target_partner' }),
        pb.collection('referrals').getFullList({ filter: 'type="conversion" && is_paid=false' }),
      ])
      setUsers(uRes)
      setLogs(lRes)
      setPendingRefs(rRes)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('users', () => loadData())
  useRealtime('commission_audit_logs', () => loadData())
  useRealtime('referrals', () => loadData())

  const openEdit = (user: any) => {
    setEditUser(user)
    setEditData({
      role: user.role,
      rate: user.commission_rate
        ? user.commission_rate.toString()
        : user.role === 'affiliate'
          ? '2.0'
          : '1.0',
      isVerified: user.is_verified || false,
    })
  }

  const handleSave = async () => {
    const numRate = parseFloat(editData.rate)
    if (isNaN(numRate) || numRate < 1.0 || numRate > 5.0) {
      return toast({ title: 'Erro', description: 'Taxa inválida.', variant: 'destructive' })
    }
    try {
      await pb.collection('users').update(editUser.id, {
        role: editData.role,
        commission_rate: numRate,
        is_verified: editData.isVerified,
      })
      toast({ title: 'Sucesso', description: 'Parceiro atualizado com sucesso!' })
      setEditUser(null)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handlePayout = async (partnerId: string) => {
    const unpaid = pendingRefs.filter((r) => r.affiliate === partnerId)
    if (unpaid.length === 0)
      return toast({ title: 'Sem pendências', description: 'Nenhuma comissão pendente.' })
    try {
      for (const ref of unpaid) await pb.collection('referrals').update(ref.id, { is_paid: true })
      toast({ title: 'Sucesso', description: `${unpaid.length} conversões pagas.` })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const renderTable = (roleFilter: string) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome / E-mail</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Taxa</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Pendente</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users
          .filter((u) => u.role === roleFilter)
          .map((user) => {
            const amt = pendingRefs
              .filter((r) => r.affiliate === user.id)
              .reduce((acc, r) => acc + 500 * ((user.commission_rate || 2) / 100), 0)
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.name || 'Sem nome'}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.affiliate_code || user.id.slice(0, 8)}</Badge>
                </TableCell>
                <TableCell>
                  {user.commission_rate || (roleFilter === 'affiliate' ? 2 : 1)}%
                </TableCell>
                <TableCell>
                  {user.is_verified ? (
                    <Badge className="bg-emerald-500">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <ShieldAlert className="w-3 h-3 mr-1" />
                      Inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-semibold text-red-500">R$ {amt.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600"
                    onClick={() => handlePayout(user.id)}
                    title="Pagar"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
      </TableBody>
    </Table>
  )

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Auditoria de Parceiros</h2>
        <p className="text-muted-foreground">
          Gerencie Afiliados, Agentes e audite o histórico de taxas.
        </p>
      </div>

      <Tabs key={defaultTab} defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="affiliate">Afiliados (Influenciadores)</TabsTrigger>
          <TabsTrigger value="agent">Agentes (Consultores)</TabsTrigger>
          <TabsTrigger value="audit">Logs de Auditoria</TabsTrigger>
        </TabsList>
        <TabsContent value="affiliate">
          <Card>
            <CardContent className="pt-6">{renderTable('affiliate')}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="agent">
          <Card>
            <CardContent className="pt-6">{renderTable('agent')}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="audit">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>Taxa Antiga</TableHead>
                    <TableHead>Nova Taxa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(parseISO(log.created), 'dd/MM/yy HH:mm')}</TableCell>
                      <TableCell>
                        {log.expand?.admin_user?.name || log.expand?.admin_user?.email}
                      </TableCell>
                      <TableCell>
                        {log.expand?.target_partner?.name || log.expand?.target_partner?.email}
                      </TableCell>
                      <TableCell>{log.previous_rate}%</TableCell>
                      <TableCell>{log.new_rate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Parceiro</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Perfil</Label>
              <Select
                value={editData.role}
                onValueChange={(v) =>
                  setEditData({
                    ...editData,
                    role: v,
                    rate: v === 'affiliate' ? '2.0' : editData.rate,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="affiliate">Afiliado (Fixo 2%)</SelectItem>
                  <SelectItem value="agent">Agente (Variável)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Taxa de Comissão (%)</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={editData.rate}
                  onChange={(e) => setEditData({ ...editData, rate: e.target.value })}
                  disabled={editData.role === 'affiliate'}
                  className="pl-8"
                />
                <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center justify-between border p-4 rounded-lg">
              <Label>Ativo</Label>
              <Switch
                checked={editData.isVerified}
                onCheckedChange={(v) => setEditData({ ...editData, isVerified: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
