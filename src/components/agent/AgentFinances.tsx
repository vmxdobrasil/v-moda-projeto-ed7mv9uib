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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function AgentFinances({ referrals, user }: { referrals: any[]; user: any }) {
  const getRefValue = (ref: any) => {
    if (ref.metadata?.commission_value) return Number(ref.metadata.commission_value)
    if (ref.metadata?.amount)
      return Number(ref.metadata.amount) * ((user?.commission_rate || 0) / 100)
    return 0
  }

  const grouped = referrals.reduce(
    (acc, ref) => {
      const month = format(new Date(ref.created), 'MMMM yyyy', { locale: ptBR })
      if (!acc[month]) acc[month] = []
      acc[month].push(ref)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extrato Mensal de Comissões</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {Object.keys(grouped).length > 0 ? (
          Object.entries(grouped).map(([month, refs]) => (
            <div key={month} className="space-y-4">
              <h3 className="font-semibold text-lg capitalize">{month}</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Taxa (%)</TableHead>
                      <TableHead className="text-right">Valor Líquido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refs.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{format(new Date(r.created), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="capitalize">{r.type}</TableCell>
                        <TableCell>
                          <Badge variant={r.is_paid ? 'default' : 'outline'}>
                            {r.is_paid ? 'Pago' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user?.commission_rate || 0}%</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          + R$ {getRefValue(r).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Nenhuma comissão registrada até o momento.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
