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
import pb from '@/lib/pocketbase/client'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export function CRMVClubFinancials() {
  const [breakdown, setBreakdown] = useState<any[]>([])
  const [totalMetrics, setTotalMetrics] = useState({ limit: 0, consumed: 0 })

  useEffect(() => {
    async function loadData() {
      try {
        const cards = await pb.collection('v_club_cards').getFullList({ expand: 'store,customer' })

        const roleMap: Record<string, { role: string; limit: number; available: number }> = {}

        let totalL = 0
        let totalC = 0

        for (const card of cards) {
          const l = card.credit_limit || 0
          const a = card.available_limit || 0
          const role = card.expand?.store?.role || 'Desconhecido'

          if (!roleMap[role]) {
            roleMap[role] = { role, limit: 0, available: 0 }
          }
          roleMap[role].limit += l
          roleMap[role].available += a

          totalL += l
          totalC += l - a
        }

        setTotalMetrics({ limit: totalL, consumed: totalC })

        const mapped = Object.values(roleMap).map((v) => ({
          name: v.role,
          Liberado: v.limit,
          Consumido: v.limit - v.available,
        }))

        setBreakdown(mapped)
      } catch (err) {
        console.error('Error fetching V Club financials', err)
      }
    }
    loadData()
  }, [])

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle>V Club - Controle Financeiro</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-muted/50 p-6 rounded-lg border">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Total Limite Liberado
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {formatCurrency(totalMetrics.limit)}
            </div>
          </div>
          <div className="bg-muted/50 p-6 rounded-lg border">
            <div className="text-sm font-medium text-muted-foreground mb-2">Total Consumido</div>
            <div className="text-3xl font-bold">{formatCurrency(totalMetrics.consumed)}</div>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Perfil da Loja</TableHead>
                <TableHead className="text-right">Limite Liberado</TableHead>
                <TableHead className="text-right">Consumido</TableHead>
                <TableHead className="text-right">Utilização (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdown.map((row) => {
                const percentage = row.Liberado > 0 ? (row.Consumido / row.Liberado) * 100 : 0
                return (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium capitalize">
                      {row.name === 'manufacturer'
                        ? 'Fabricante'
                        : row.name === 'retailer'
                          ? 'Lojista'
                          : row.name}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(row.Liberado)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.Consumido)}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${percentage > 80 ? 'bg-red-100 text-red-700' : percentage > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}
                      >
                        {percentage.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
              {breakdown.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhum dado encontrado
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
