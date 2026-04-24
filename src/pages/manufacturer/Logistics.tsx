import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { MapPin, Truck } from 'lucide-react'

export default function ManufacturerLogistics() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) return
        const records = await pb.collection('customers').getFullList({
          filter: `manufacturer = "${user.id}" && logistics_status != ""`,
          sort: '-updated',
        })
        setCustomers(records)
      } catch (error) {
        console.error('Error loading logistics', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aguardando Ônibus':
        return 'bg-yellow-100 text-yellow-800'
      case 'Em Trânsito no Ônibus':
        return 'bg-blue-100 text-blue-800'
      case 'Entregue':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Logística e Entregas</h2>
        <p className="text-muted-foreground">
          Acompanhe as rotas, caravanas e status de entrega dos seus clientes.
        </p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Status Logístico</TableHead>
                <TableHead>Rota / Caravana</TableHead>
                <TableHead>Poltrona</TableHead>
                <TableHead>Frete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <Truck className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                    Nenhum cliente com logística ativa.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(c.logistics_status)}`}
                      >
                        {c.logistics_status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />{' '}
                          {c.active_route || '-'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {c.caravan_name || 'Sem caravana'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{c.seat_number ? `#${c.seat_number}` : '-'}</TableCell>
                    <TableCell>
                      {c.freight_value ? `R$ ${c.freight_value.toFixed(2)}` : '-'}
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
