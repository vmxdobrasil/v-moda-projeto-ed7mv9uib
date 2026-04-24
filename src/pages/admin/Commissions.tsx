import { useEffect, useState, useMemo } from 'react'
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
import { DollarSign, Truck } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

export default function AdminCommissions() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const records = await pb.collection('customers').getFullList({
        filter: 'freight_value > 0 || logistics_status != "" || shipping_method != ""',
        sort: '-updated',
        expand: 'manufacturer',
      })
      setCustomers(records)
    } catch (error) {
      console.error('Error loading commissions', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', () => loadData())

  const { totalFreight, totalCommission } = useMemo(() => {
    let f = 0
    let c = 0
    customers.forEach((cust) => {
      const val = cust.freight_value || 0
      const rate = cust.expand?.manufacturer?.freight_commission_rate || 0
      f += val
      c += val * (rate / 100)
    })
    return { totalFreight: f, totalCommission: c }
  }, [customers])

  const formatPayer = (payer?: string) => {
    if (payer === 'manufacturer') return 'Fabricante'
    if (payer === 'retailer') return 'Loja/Revendedora'
    return '-'
  }

  const formatMethod = (method?: string) => {
    if (method === 'transportadora') return 'Transportadora'
    if (method === 'correios') return 'Correios'
    if (method === 'caravana_onibus') return 'Caravana/Ônibus'
    return '-'
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Comissões de Logística</h2>
        <p className="text-muted-foreground">
          Monitore os valores de frete e as comissões geradas para a plataforma.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total em Fretes</CardTitle>
            <Truck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalFreight.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Comissão Gerada</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalCommission.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Fabricante</TableHead>
                <TableHead>Método de Envio</TableHead>
                <TableHead>Pagador do Frete</TableHead>
                <TableHead className="text-right">Valor do Frete</TableHead>
                <TableHead className="text-right">Comissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Nenhum registro de logística encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => {
                  const val = c.freight_value || 0
                  const rate = c.expand?.manufacturer?.freight_commission_rate || 0
                  const comm = val * (rate / 100)

                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.expand?.manufacturer?.name || '-'}</TableCell>
                      <TableCell>{formatMethod(c.shipping_method)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted">
                          {formatPayer(c.freight_payer)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">R$ {val.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        R$ {comm.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
