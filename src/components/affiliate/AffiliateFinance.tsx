import { useState, useEffect, useMemo } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Wallet, TrendingUp, Clock, ArrowDownToLine } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { RecordModel } from 'pocketbase'

export function AffiliateFinance() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<RecordModel[]>([])
  const [requesting, setRequesting] = useState(false)

  const loadTransactions = async () => {
    if (!user) return
    try {
      const records = await pb.collection('financial_transactions').getFullList({
        filter: `store = "${user.id}" && category = "affiliate_commission"`,
        sort: '-created',
      })
      setTransactions(records)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [user])

  useRealtime('financial_transactions', () => loadTransactions())

  const { pendingTotal, paidTotal, available } = useMemo(() => {
    let pending = 0
    let paid = 0
    let withdrawn = 0
    transactions.forEach((t) => {
      const amount = t.amount || 0
      if (t.type === 'receivable') {
        if (t.status === 'pending') pending += amount
        if (t.status === 'paid') paid += amount
      }
      if (t.type === 'payable' && t.status === 'paid') {
        withdrawn += amount
      }
    })
    return { pendingTotal: pending, paidTotal: paid, available: paid - withdrawn }
  }, [transactions])

  const handleWithdraw = async () => {
    if (available <= 0) {
      toast({ title: 'Saldo indisponível para saque.', variant: 'destructive' })
      return
    }
    setRequesting(true)
    try {
      await pb.collection('financial_transactions').create({
        store: user!.id,
        type: 'payable',
        category: 'withdrawal_request',
        amount: available,
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        description: `Solicitação de saque - Afiliado ${user!.name}`,
      })
      toast({
        title: 'Solicitação de saque enviada!',
        description: 'O admin processará seu pagamento via Asaas.',
      })
      loadTransactions()
    } catch (err: any) {
      toast({ title: 'Erro ao solicitar saque', description: err.message, variant: 'destructive' })
    } finally {
      setRequesting(false)
    }
  }

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingTotal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Disponível</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(available)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paidTotal)}</div>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={handleWithdraw}
        disabled={requesting || available <= 0}
        className="bg-electric hover:bg-electric/90 text-electric-foreground"
      >
        <ArrowDownToLine className="w-4 h-4 mr-2" />
        {requesting ? 'Processando...' : 'Solicitar Saque'}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Extrato Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    Nenhuma transação registrada.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{new Date(t.created).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-sm">{t.description || '-'}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${t.type === 'receivable' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {t.type === 'receivable' ? '+' : '-'}
                      {formatCurrency(t.amount || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'paid' ? 'default' : 'secondary'}>
                        {t.status === 'paid'
                          ? 'Pago'
                          : t.status === 'pending'
                            ? 'Pendente'
                            : t.status}
                      </Badge>
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
