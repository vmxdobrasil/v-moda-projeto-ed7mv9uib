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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Package, MessageCircle, Loader2 } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { Customer } from '@/services/customers'

export default function DashboardHub() {
  const [metrics, setMetrics] = useState({ leads: 0, projects: 0, messages: 0 })
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [leadsRes, projectsRes, msgsRes, recentRes] = await Promise.all([
        pb
          .collection('customers')
          .getList(1, 1)
          .catch(() => ({ totalItems: 0 })),
        pb
          .collection('projects')
          .getList(1, 1)
          .catch(() => ({ totalItems: 0 })),
        pb
          .collection('messages')
          .getList(1, 1, { filter: 'status="pending"' })
          .catch(() => ({ totalItems: 0 })),
        pb
          .collection('customers')
          .getList<Customer>(1, 10, { sort: '-created' })
          .catch(() => ({ items: [] })),
      ])

      setMetrics({
        leads: leadsRes?.totalItems || 0,
        projects: projectsRes?.totalItems || 0,
        messages: msgsRes?.totalItems || 0,
      })
      setRecentCustomers(recentRes?.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', loadData)
  useRealtime('projects', loadData)
  useRealtime('messages', loadData)

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return
    setIsUpdating(true)
    try {
      await pb.collection('customers').update(selectedCustomer.id, {
        status: selectedCustomer.status,
        notes: selectedCustomer.notes,
      })
      toast({ description: 'Cliente atualizado com sucesso!' })
      setSelectedCustomer(null)
    } catch (error) {
      toast({ description: 'Erro ao atualizar cliente.', variant: 'destructive' })
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Métricas em tempo real e visão geral do negócio.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads (Clientes)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.leads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.projects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Pendentes</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.messages}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {customer.status || 'novo'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(customer.created).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
                {recentCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      Nenhum cliente recente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Detalhes do Lead</SheetTitle>
            <SheetDescription>Visualize e edite as informações do lead.</SheetDescription>
          </SheetHeader>

          {selectedCustomer && (
            <div className="space-y-6 py-6">
              <div>
                <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCustomer.email || 'Sem email'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Telefone</span>
                  <span className="font-medium">{selectedCustomer.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Cidade</span>
                  <span className="font-medium">{selectedCustomer.city || '-'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selectedCustomer.status || 'new'}
                  onValueChange={(v: any) =>
                    setSelectedCustomer({ ...selectedCustomer, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="interested">Interessado</SelectItem>
                    <SelectItem value="negotiating">Em Negociação</SelectItem>
                    <SelectItem value="converted">Convertido</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  value={selectedCustomer.notes || ''}
                  onChange={(e) =>
                    setSelectedCustomer({ ...selectedCustomer, notes: e.target.value })
                  }
                  rows={6}
                  placeholder="Adicione observações importantes sobre este cliente..."
                />
              </div>
            </div>
          )}

          <SheetFooter className="mt-4">
            <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateCustomer} disabled={isUpdating}>
              {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
