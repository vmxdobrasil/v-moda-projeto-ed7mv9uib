import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Edit2, Percent, Users, ShieldCheck, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useRealtime } from '@/hooks/use-realtime'

export default function AdminAgents() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<any>(null)
  const [rate, setRate] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const { toast } = useToast()

  const loadAgents = async () => {
    try {
      const res = await pb.collection('users').getFullList({
        filter: 'role="agent"',
        sort: '-created',
      })
      setAgents(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [])

  useRealtime('users', () => {
    loadAgents()
  })

  const openEdit = (user: any) => {
    setEditUser(user)
    setRate(user.commission_rate ? user.commission_rate.toString() : '1.0')
    setIsVerified(user.is_verified || false)
  }

  const handleSave = async () => {
    const numRate = parseFloat(rate)
    if (isNaN(numRate) || numRate < 1.0 || numRate > 5.0) {
      toast({
        title: 'Erro de Validação',
        description: 'A taxa de comissão para agentes deve ser entre 1.0 e 5.0%.',
        variant: 'destructive',
      })
      return
    }

    try {
      await pb.collection('users').update(editUser.id, {
        commission_rate: numRate,
        is_verified: isVerified,
      })
      toast({ title: 'Sucesso', description: 'Dados do agente atualizados com sucesso!' })
      setEditUser(null)
    } catch (e: any) {
      toast({
        title: 'Erro ao atualizar',
        description: getErrorMessage(e),
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Agentes Credenciados</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie agentes credenciados e configure suas comissões (1% a 5%).
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Agentes Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Taxa de Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || 'Sem nome'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {user.affiliate_code || user.id.substring(0, 8)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-medium text-emerald-600">
                          {user.commission_rate ? user.commission_rate : '1.0'}%
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.is_verified ? (
                          <Badge
                            variant="default"
                            className="bg-emerald-500 hover:bg-emerald-600 gap-1"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-muted-foreground">
                            <ShieldAlert className="w-3 h-3" />
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Gerenciar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {agents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum agente encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Agente</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label>Agente</Label>
              <Input
                value={editUser?.name || editUser?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Taxa de Comissão (%)</Label>
              <div className="relative">
                <Input
                  id="rate"
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="pl-8"
                />
                <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Defina um valor entre 1.0 e 5.0% para o agente.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Status do Agente</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar a participação no programa de comissões.
                </p>
              </div>
              <Switch checked={isVerified} onCheckedChange={setIsVerified} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
