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
          filter: `manufacturer = "${user.id}" && (logistics_status != "" || shipping_method != "")`,
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
      case 'Aguardando Envio':
        return 'bg-yellow-100 text-yellow-800'
      case 'Em Trânsito no Ônibus':
      case 'Em Trânsito':
      case 'Postado':
        return 'bg-blue-100 text-blue-800'
      case 'Entregue':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatShippingMethod = (method: string) => {
    switch (method) {
      case 'transportadora':
        return 'Transportadora'
      case 'correios':
        return 'Correios'
      case 'caravana_onibus':
        return 'Caravana/Ônibus'
      default:
        return '-'
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
                <TableHead>Método de Envio</TableHead>
                <TableHead>Status Logístico</TableHead>
                <TableHead>Detalhes</TableHead>
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
                    <TableCell>{formatShippingMethod(c.shipping_method)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(c.logistics_status)}`}
                      >
                        {c.logistics_status || 'Pendente'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {c.shipping_method === 'transportadora' ||
                      c.shipping_method === 'correios' ? (
                        <div className="flex flex-col gap-1">
                          {c.tracking_code ? (
                            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded w-fit">
                              {c.tracking_code}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sem rastreio</span>
                          )}
                          {c.shipping_date && (
                            <span className="text-xs text-muted-foreground">
                              Enviado em: {new Date(c.shipping_date).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />{' '}
                            {c.active_route || '-'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {c.caravan_name || 'Sem caravana'}
                            {c.seat_number ? ` • Poltrona #${c.seat_number}` : ''}
                          </span>
                        </div>
                      )}
                    </TableCell>
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
