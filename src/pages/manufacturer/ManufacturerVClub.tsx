import { useEffect, useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, Wallet, Users } from 'lucide-react'
import { formatPrice } from '@/lib/data'

export default function ManufacturerVClub() {
  const [settings, setSettings] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [cashbackRate, setCashbackRate] = useState('0')
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const storeId = pb.authStore.record?.id
      if (!storeId) return

      const [sets, crds, custs] = await Promise.all([
        pb
          .collection('v_club_settings')
          .getFirstListItem(`store = "${storeId}"`)
          .catch(() => null),
        pb
          .collection('v_club_cards')
          .getFullList({ filter: `store = "${storeId}"`, expand: 'customer' }),
        pb.collection('customers').getFullList({ filter: `manufacturer = "${storeId}"` }),
      ])

      setSettings(sets)
      if (sets) setCashbackRate(sets.store_cashback_rate.toString())
      setCards(crds)
      setCustomers(custs)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdateCashback = async () => {
    if (!settings) return
    try {
      await pb
        .collection('v_club_settings')
        .update(settings.id, { store_cashback_rate: parseFloat(cashbackRate) })
      toast({ description: 'Taxa de Cashback atualizada com sucesso!' })
      loadData()
    } catch (e) {
      toast({ description: 'Erro ao atualizar cashback.', variant: 'destructive' })
    }
  }

  const handleIssueCard = async (customerId: string) => {
    try {
      await pb.send('/backend/v1/v-club/credit-analysis', {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          storeId: pb.authStore.record?.id,
          requestedLimit: 5000,
        }),
      })
      toast({ description: 'Cartão emitido com sucesso!' })
      loadData()
    } catch (e: any) {
      toast({ description: e.message || 'Erro ao emitir cartão', variant: 'destructive' })
    }
  }

  if (!settings || !settings.is_active) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center animate-fade-in-up">
        <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">V Club Card Não Ativado</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          O programa Private Label V Club ainda não está ativo para sua loja. Entre em contato com o
          suporte da plataforma para habilitação.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">V Club Card CRM</h2>
        <p className="text-muted-foreground">
          Gerencie cartões, limites e cashback da sua loja. (BIN {636943} - ID:{' '}
          {settings.store_identifier})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Cartões Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cards.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" /> Cashback Oferecido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                className="w-20"
                type="number"
                step="0.1"
                value={cashbackRate}
                onChange={(e) => setCashbackRate(e.target.value)}
              />
              <span className="font-bold">%</span>
              <Button size="sm" onClick={handleUpdateCashback}>
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Comissão Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{settings.platform_commission_rate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Definido pelo Admin Master</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emissão e Gestão de Limites</CardTitle>
          <CardDescription>
            Convide clientes VIP e acompanhe os limites de crédito concedidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente VIP</TableHead>
                <TableHead>Status V Club</TableHead>
                <TableHead>Cartão Gerado</TableHead>
                <TableHead className="text-right">Limite Total</TableHead>
                <TableHead className="text-right">Limite Disponível</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => {
                const card = cards.find((card) => card.customer === c.id)
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <span className="uppercase text-xs font-bold tracking-wider px-2 py-1 bg-muted rounded">
                        {c.v_club_status || 'Nenhum'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {card ? (
                        <span className="font-mono text-sm tracking-widest text-muted-foreground">
                          **** **** **** {card.card_number.slice(-4)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {card ? formatPrice(card.credit_limit) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {card ? formatPrice(card.available_limit) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {!card && (
                        <Button size="sm" onClick={() => handleIssueCard(c.id)}>
                          Analisar & Emitir
                        </Button>
                      )}
                      {card && (
                        <Button size="sm" variant="outline">
                          Gerenciar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
