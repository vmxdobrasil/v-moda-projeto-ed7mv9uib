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
import { CreditCard, Wallet, CheckCircle } from 'lucide-react'
import { getVClubCards, getVClubCashback } from '@/services/v-club'
import { useRealtime } from '@/hooks/use-realtime'

const statusVariant = (s: string): any =>
  s === 'active' ? 'default' : s === 'blocked' ? 'destructive' : 'secondary'

const physLabel = (s: string) => {
  const m: Record<string, string> = {
    none: 'Nenhum',
    requested: 'Solicitado',
    produced: 'Produzido',
    in_transit: 'Em Trânsito',
    delivered: 'Entregue',
    active: 'Ativo',
  }
  return m[s] || s
}

export function AdminMasterVClub() {
  const [cards, setCards] = useState<any[]>([])
  const [cashbacks, setCashbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [c, cb] = await Promise.all([
        getVClubCards().catch(() => []),
        getVClubCashback().catch(() => []),
      ])
      setCards(c as any[])
      setCashbacks(cb as any[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('v_club_cards', loadData)
  useRealtime('v_club_cashback', loadData)

  const activeCards = cards.filter((c) => c.status === 'active').length
  const totalLimit = cards.reduce((s, c) => s + (c.credit_limit || 0), 0)
  const totalCashback = cashbacks.reduce((s, c) => s + (c.balance || 0), 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl shadow-soft border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartões Ativos</CardTitle>
            <CreditCard className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCards}</div>
            <p className="text-xs text-muted-foreground">de {cards.length} total</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-soft border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limite Total</CardTitle>
            <Wallet className="h-5 w-5 text-electric" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalLimit.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-soft border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cashback Total</CardTitle>
            <CheckCircle className="h-5 w-5 text-emerald" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCashback.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-soft border-primary/10">
        <CardHeader>
          <CardTitle className="font-display">Cartões V Club</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cartão Físico</TableHead>
                <TableHead>Limite</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-medium">**** {card.card_number?.slice(-4)}</TableCell>
                  <TableCell>{card.expand?.customer?.name || 'N/A'}</TableCell>
                  <TableCell>{card.expand?.store?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(card.status)}>{card.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {physLabel(card.physical_status)}
                    </span>
                  </TableCell>
                  <TableCell>R$ {(card.credit_limit || 0).toLocaleString('pt-BR')}</TableCell>
                </TableRow>
              ))}
              {cards.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    Nenhum cartão encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-soft border-primary/10">
        <CardHeader>
          <CardTitle className="font-display">Saldos de Cashback</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashbacks.map((cb) => (
                <TableRow key={cb.id}>
                  <TableCell className="font-medium">
                    {cb.expand?.customer?.name || 'N/A'}
                  </TableCell>
                  <TableCell>{cb.expand?.store?.name || 'N/A'}</TableCell>
                  <TableCell>R$ {(cb.balance || 0).toLocaleString('pt-BR')}</TableCell>
                </TableRow>
              ))}
              {cashbacks.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    Nenhum cashback encontrado.
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
