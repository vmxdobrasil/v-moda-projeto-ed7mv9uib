import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditCard, Wallet, Award, Eye } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

export function AdminMasterVClub() {
  const [cards, setCards] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [cashback, setCashback] = useState<any[]>([])

  const loadData = async () => {
    try {
      const [cardsRes, txRes, cbRes] = await Promise.all([
        pb
          .collection('v_club_cards')
          .getFullList({ expand: 'customer,store' })
          .catch(() => []),
        pb
          .collection('v_club_transactions')
          .getFullList({ expand: 'store,card', sort: '-created' })
          .catch(() => []),
        pb
          .collection('v_club_cashback')
          .getFullList({ expand: 'customer,store' })
          .catch(() => []),
      ])
      setCards(cardsRes as any[])
      setTransactions((txRes as any[]).slice(0, 10))
      setCashback(cbRes as any[])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('v_club_cards', loadData)
  useRealtime('v_club_transactions', loadData)

  const activeCards = cards.filter((c) => c.status === 'active').length
  const blockedCards = cards.filter((c) => c.status === 'blocked').length
  const totalCreditLimit = cards.reduce((s, c) => s + (c.credit_limit || 0), 0)
  const totalCashback = cashback.reduce((s, c) => s + (c.balance || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-display text-navy dark:text-white">V Club Card</h2>
        <Link to="/admin/v-club">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Gerenciar V Club
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-soft border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartões Ativos</CardTitle>
            <CreditCard className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCards}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-soft border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueados</CardTitle>
            <CreditCard className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedCards}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-soft border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limite Total</CardTitle>
            <Award className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalCreditLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-soft border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cashback Total</CardTitle>
            <Wallet className="h-5 w-5 text-emerald" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald">
              R$ {totalCashback.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-soft border-primary/10">
        <CardHeader>
          <CardTitle className="font-display">Transações Recentes</CardTitle>
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
                  <TableCell>{t.expand?.store?.name || '—'}</TableCell>
                  <TableCell>R$ {(t.amount || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.status === 'approved'
                          ? 'default'
                          : t.status === 'denied'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {t.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    Nenhuma transação encontrada.
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
