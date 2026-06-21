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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'

export function CRMExclusivityZones() {
  const [requests, setRequests] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [allCustomers, setAllCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [newZone, setNewZone] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const loadRequests = async () => {
    try {
      const records = await pb.collection('zone_requests').getFullList({
        sort: '-created',
        expand: 'requester',
      })
      setRequests(records)
    } catch (err) {
      console.error('Failed to load zone requests', err)
    }
  }

  const loadCustomers = async () => {
    try {
      const records = await pb.collection('customers').getFullList({
        filter: "exclusivity_zone != '' || is_exclusive = true",
        sort: 'name',
      })
      setCustomers(records)
    } catch (err) {
      console.error(err)
    }
  }

  const loadAllCustomers = async () => {
    if (allCustomers.length > 0) return
    try {
      const records = await pb.collection('customers').getFullList({
        sort: 'name',
      })
      setAllCustomers(records)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadRequests()
    loadCustomers()
  }, [])

  useRealtime('zone_requests', () => {
    loadRequests()
  })

  useRealtime('customers', () => {
    loadCustomers()
  })

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await pb.collection('zone_requests').update(id, { status: newStatus })
      toast({ title: `Solicitação ${newStatus === 'approved' ? 'Aprovada' : 'Recusada'}` })
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao atualizar solicitação', variant: 'destructive' })
    }
  }

  const handleUpdateZone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return
    try {
      await pb
        .collection('customers')
        .update(selectedCustomer, { exclusivity_zone: newZone, is_exclusive: !!newZone })
      toast({ title: 'Zona atualizada com sucesso' })
      setDialogOpen(false)
      setNewZone('')
      setSelectedCustomer('')
    } catch (err) {
      toast({ title: 'Erro ao atualizar zona', variant: 'destructive' })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white border-transparent">
            Aprovado
          </Badge>
        )
      case 'denied':
        return <Badge variant="destructive">Recusado</Badge>
      default:
        return <Badge variant="secondary">Pendente</Badge>
    }
  }

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
        <CardTitle>Gestão de Exclusividade Territorial</CardTitle>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (open) loadAllCustomers()
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              Atribuir Zona Manualmente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atribuir Exclusividade de Zona</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateZone} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Cliente / Marca</Label>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione um cliente...
                  </option>
                  {allCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Zona de Exclusividade</Label>
                <Input
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  placeholder="Ex: Região Sul de SP"
                  className="focus-visible:ring-orange-500"
                />
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                Salvar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Data</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Zona / Região</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-4">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="pl-4">
                  {new Date(req.created).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>{req.expand?.requester?.name || 'Desconhecido'}</TableCell>
                <TableCell className="font-medium">{req.zone_name}</TableCell>
                <TableCell>{getStatusBadge(req.status)}</TableCell>
                <TableCell className="text-right space-x-2 pr-4">
                  {req.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleStatusChange(req.id, 'approved')}
                      >
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleStatusChange(req.id, 'denied')}
                      >
                        Recusar
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  Nenhuma solicitação de exclusividade pendente no momento.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {customers.length > 0 && (
          <div className="p-6 border-t bg-muted/10">
            <h3 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wider">
              Zonas Ativas Atuais
            </h3>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {customers.map((c) => (
                <div
                  key={c.id}
                  className="p-4 border rounded-lg bg-background flex flex-col gap-1 shadow-sm border-l-4 border-l-orange-500"
                >
                  <span className="font-semibold text-sm line-clamp-1">{c.name}</span>
                  <span className="text-xs text-orange-700 bg-orange-100 w-fit px-2 py-1 rounded-md mt-1 font-medium">
                    {c.exclusivity_zone || 'Exclusivo (Geral)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
