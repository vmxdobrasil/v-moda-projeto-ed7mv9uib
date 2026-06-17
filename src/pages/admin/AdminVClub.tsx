import { useEffect, useState } from 'react'
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

export default function AdminVClub() {
  const [settings, setSettings] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, transactionsRes] = await Promise.all([
          pb.collection('v_club_settings').getFullList({ expand: 'store' }),
          pb
            .collection('v_club_transactions')
            .getFullList({ expand: 'store,card', sort: '-created', limit: 50 }),
        ])
        setSettings(settingsRes)
        setTransactions(transactionsRes)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">V Club Card (Admin)</h2>
        <p className="text-muted-foreground">
          Gestão centralizada de configurações e transações do V Club Card.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Lojas (V Club)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loja/Fabricante</TableHead>
                <TableHead>Identificador</TableHead>
                <TableHead>Taxa Plataforma (%)</TableHead>
                <TableHead>Taxa Cashback (%)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.expand?.store?.name}</TableCell>
                  <TableCell>{s.store_identifier}</TableCell>
                  <TableCell>{s.platform_commission_rate}</TableCell>
                  <TableCell>{s.store_cashback_rate}</TableCell>
                  <TableCell>
                    <Badge variant={s.is_active ? 'default' : 'secondary'}>
                      {s.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {settings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Nenhuma loja configurada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Cartão</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.created).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{t.expand?.store?.name}</TableCell>
                  <TableCell>**** {t.expand?.card?.card_number?.slice(-4)}</TableCell>
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
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
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
