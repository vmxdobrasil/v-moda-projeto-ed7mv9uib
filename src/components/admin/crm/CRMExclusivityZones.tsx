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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export function CRMExclusivityZones() {
  const [requests, setRequests] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const loadRequests = async () => {
    try {
      const res = await pb.collection('zone_requests').getList(1, 50, {
        filter: "status = 'pending'",
        expand: 'requester',
      })
      setRequests(res.items)
    } catch (e) {
      console.error(e)
    }
  }

  const loadCustomers = async () => {
    try {
      const res = await pb.collection('customers').getList(1, 50, {
        filter: search ? `name ~ "${search}"` : `exclusivity_zone != ""`,
        sort: '-updated',
      })
      setCustomers(res.items)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadRequests()
    loadCustomers()
    // eslint-disable-next-react-hooks/exhaustive-deps
  }, [search])

  const handleUpdateZone = async (id: string, zone: string) => {
    try {
      await pb.collection('customers').update(id, { exclusivity_zone: zone })
      toast({ title: 'Sucesso', description: 'Zona de exclusividade atualizada.' })
      loadCustomers()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleRequest = async (id: string, status: string) => {
    try {
      await pb.collection('zone_requests').update(id, { status })
      toast({
        title: 'Sucesso',
        description: `Solicitação ${status === 'approved' ? 'aprovada' : 'negada'}.`,
      })
      loadRequests()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Zonas Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitante</TableHead>
                <TableHead>Zona Solicitada</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    {req.expand?.requester?.name || req.expand?.requester?.email}
                  </TableCell>
                  <TableCell>{req.zone_name}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" onClick={() => handleRequest(req.id, 'approved')}>
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRequest(req.id, 'denied')}
                    >
                      Negar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    Nenhuma solicitação pendente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Zonas de Marcas</CardTitle>
          <Input
            placeholder="Buscar marca por nome para alterar a zona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md mt-4"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca</TableHead>
                <TableHead>Zona de Exclusividade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <Input
                      defaultValue={c.exclusivity_zone}
                      onBlur={(e) => {
                        if (e.target.value !== c.exclusivity_zone) {
                          handleUpdateZone(c.id, e.target.value)
                        }
                      }}
                      className="max-w-xs"
                      placeholder="Ex: Sudeste, Norte..."
                    />
                  </TableCell>
                  <TableCell>
                    {c.exclusivity_zone ? (
                      <Badge variant="secondary">Ativa</Badge>
                    ) : (
                      <Badge variant="outline">Sem exclusividade</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    Nenhuma marca encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
