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
import pb from '@/lib/pocketbase/client'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export function CRMVClubFinancials() {
  const [metrics, setMetrics] = useState({ totalReleased: 0, totalConsumed: 0 })
  const [breakdown, setBreakdown] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const cards = await pb.collection('v_club_cards').getFullList({ expand: 'store' })
        let released = 0
        let available = 0
        const segmentMap: Record<string, { released: number; consumed: number }> = {}

        for (const card of cards) {
          released += card.credit_limit || 0
          available += card.available_limit || 0
          const consumed = (card.credit_limit || 0) - (card.available_limit || 0)

          const segment = card.expand?.store?.segment_tier || card.expand?.store?.role || 'Outros'
          if (!segmentMap[segment]) segmentMap[segment] = { released: 0, consumed: 0 }
          segmentMap[segment].released += card.credit_limit || 0
          segmentMap[segment].consumed += consumed
        }

        setMetrics({ totalReleased: released, totalConsumed: released - available })
        setBreakdown(Object.entries(segmentMap).map(([k, v]) => ({ segment: k, ...v })))

        const trans = await pb.collection('v_club_transactions').getList(1, 10, {
          sort: '-created',
          expand: 'card,store',
        })
        setTransactions(trans.items)
      } catch (err) {
        console.error('Error fetching V Club financials', err)
      }
    }
    loadData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total de Crédito Liberado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(metrics.totalReleased)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total de Crédito Consumido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(metrics.totalConsumed)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Segmento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segmento/Papel</TableHead>
                <TableHead className="text-right">Crédito Liberado</TableHead>
                <TableHead className="text-right">Crédito Consumido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdown.map((b, i) => (
                <TableRow key={i}>
                  <TableCell className="capitalize">{b.segment.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="text-right">{formatCurrency(b.released)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(b.consumed)}</TableCell>
                </TableRow>
              ))}
              {breakdown.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    Nenhum cartão emitido até o momento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.created).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{t.expand?.store?.name || t.expand?.store?.email || 'N/D'}</TableCell>
                  <TableCell>{formatCurrency(t.amount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.status === 'approved'
                          ? 'default'
                          : t.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {t.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    Nenhuma transação recente.
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
