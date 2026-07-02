import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'

export default function FinanceiroHub() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const isAdmin = user.role === 'admin' || user.email === 'valterpmendonca@gmail.com'
      const filter = isAdmin ? '' : `store = "${user.id}"`
      const data = await pb
        .collection('financial_transactions')
        .getFullList({
          filter,
          sort: '-created',
          expand: 'customer,order',
        })
        .catch(() => [])
      setTransactions(data)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('financial_transactions', loadData)

  const totalReceivable = transactions
    .filter((t) => t.type === 'receivable' && t.status !== 'paid' && t.status !== 'canceled')
    .reduce((s, t) => s + (t.amount || 0), 0)
  const totalPayable = transactions
    .filter((t) => t.type === 'payable' && t.status !== 'paid' && t.status !== 'canceled')
    .reduce((s, t) => s + (t.amount || 0), 0)
  const totalPaid = transactions
    .filter((t) => t.status === 'paid')
    .reduce((s, t) => s + (t.amount || 0), 0)

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const stats = [
    { label: 'A Receber', value: fmt(totalReceivable), icon: TrendingUp, color: 'text-emerald' },
    { label: 'A Pagar', value: fmt(totalPayable), icon: TrendingDown, color: 'text-destructive' },
    { label: 'Realizado', value: fmt(totalPaid), icon: DollarSign, color: 'text-primary' },
    { label: 'Transações', value: String(transactions.length), icon: Wallet, color: 'text-azul' },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-display">Financeiro</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Controle de contas a pagar/receber e split Asaas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="fashion-tech-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-xl md:text-2xl font-bold ${s.color}`}>{s.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="fashion-tech-card">
        <CardHeader>
          <CardTitle className="font-display">Transações Financeiras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={t.type === 'receivable' ? 'default' : 'secondary'}>
                        {t.type === 'receivable' ? 'Receber' : 'Pagar'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          t.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : t.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : t.status === 'canceled'
                                ? 'bg-gray-100 text-gray-800'
                                : ''
                        }
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{fmt(t.amount || 0)}</TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
