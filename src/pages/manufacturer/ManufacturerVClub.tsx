import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function ManufacturerVClub() {
  const { user } = useAuth()
  const [cards, setCards] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      try {
        const [cardsRes, transactionsRes] = await Promise.all([
          pb.collection('v_club_cards').getFullList({
            filter: `store = "${user.id}"`,
            expand: 'customer',
          }),
          pb.collection('v_club_transactions').getFullList({
            filter: `store = "${user.id}"`,
            expand: 'card,card.customer',
            sort: '-created',
            limit: 50,
          }),
        ])
        setCards(cardsRes)
        setTransactions(transactionsRes)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">V Club Card</h2>
        <p className="text-muted-foreground">Gestão de cartões e transações da sua loja.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartões Emitidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cards.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cartões de Clientes</CardTitle>
          <CardDescription>Status atual dos cartões emitidos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Limite Total</TableHead>
                <TableHead>Limite Disp.</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.expand?.customer?.name}</TableCell>
                  <TableCell>**** {c.card_number?.slice(-4)}</TableCell>
                  <TableCell>R$ {c.credit_limit?.toFixed(2)}</TableCell>
                  <TableCell>R$ {c.available_limit?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === 'active' ? 'default' : 'destructive'}>
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {cards.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Nenhum cartão emitido.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.created).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{t.expand?.card?.expand?.customer?.name}</TableCell>
                  <TableCell>R$ {t.amount.toFixed(2)}</TableCell>
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
