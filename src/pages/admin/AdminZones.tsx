import { useState, useEffect } from 'react'
import { MapPin, Check, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export default function AdminZones() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const records = await pb.collection('zone_requests').getFullList({
        sort: '-created',
        expand: 'requester',
      })
      setRequests(records)
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateStatus = async (
    id: string,
    newStatus: string,
    userId: string,
    zoneName: string,
  ) => {
    try {
      await pb.collection('zone_requests').update(id, { status: newStatus })

      if (newStatus === 'approved') {
        const user = await pb.collection('users').getOne(userId)
        const currentRegions = user.operating_regions || ''
        const newRegions = currentRegions ? `${currentRegions}, ${zoneName}` : zoneName

        await pb.collection('users').update(userId, {
          operating_regions: newRegions,
        })
      }

      toast({
        title: 'Status atualizado',
        description: `Solicitação ${newStatus === 'approved' ? 'aprovada' : 'negada'}.`,
      })
      loadRequests()
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Zonas de Revenda</h2>
        <p className="text-muted-foreground">
          Gerencie as solicitações de território exclusivo das Consultoras.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Solicitações
          </CardTitle>
          <CardDescription>Aprove ou recuse pedidos de exclusividade por região.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Consultora</TableHead>
                <TableHead>Zona Solicitada</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhuma solicitação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="font-medium">
                        {req.expand?.requester?.name || 'Usuário Desconhecido'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {req.expand?.requester?.email}
                      </div>
                    </TableCell>
                    <TableCell>{req.zone_name}</TableCell>
                    <TableCell>{new Date(req.created).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          req.status === 'approved'
                            ? 'default'
                            : req.status === 'denied'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {req.status === 'approved'
                          ? 'Aprovado'
                          : req.status === 'denied'
                            ? 'Negado'
                            : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {req.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() =>
                              handleUpdateStatus(req.id, 'approved', req.requester, req.zone_name)
                            }
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleUpdateStatus(req.id, 'denied', req.requester, req.zone_name)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
