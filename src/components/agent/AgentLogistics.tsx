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
import { Bus } from 'lucide-react'

export function AgentLogistics({ customers }: { customers: any[] }) {
  const caravans = customers.filter((c) => c.shipping_method === 'caravana_onibus')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bus className="h-5 w-5" />
          Rastreio de Caravanas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Nome da Caravana</TableHead>
                <TableHead>Rota Ativa</TableHead>
                <TableHead>Nº do Assento</TableHead>
                <TableHead>Status Logístico</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caravans.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.caravan_name || '-'}</TableCell>
                  <TableCell>{c.active_route || '-'}</TableCell>
                  <TableCell>{c.seat_number || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.logistics_status || 'Pendente'}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {caravans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    Nenhum cliente associado a caravanas no momento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
