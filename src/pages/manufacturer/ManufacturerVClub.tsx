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
import { CreditCard, Wallet, Users, Send, History } from 'lucide-react'
import { formatPrice } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

export default function ManufacturerVClub() {
  const [settings, setSettings] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [cashbackRate, setCashbackRate] = useState('0')
  const { toast } = useToast()
  const [isInviting, setIsInviting] = useState<Record<string, boolean>>({})
  const [refundTxId, setRefundTxId] = useState<string | null>(null)
  const [isRefunding, setIsRefunding] = useState(false)

  const loadData = async () => {
    try {
      const storeId = pb.authStore.record?.id
      if (!storeId) return

      const [sets, crds, custs, txs] = await Promise.all([
        pb
          .collection('v_club_settings')
          .getFirstListItem(`store = "${storeId}"`)
          .catch(() => null),
        pb
          .collection('v_club_cards')
          .getFullList({ filter: `store = "${storeId}"`, expand: 'customer' }),
        pb.collection('customers').getFullList({ filter: `manufacturer = "${storeId}"` }),
        pb.collection('v_club_transactions').getFullList({
          filter: `store = "${storeId}"`,
          expand: 'card.customer',
          sort: '-created',
        }),
      ])

      setSettings(sets)
      setTransactions(txs)
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

  useRealtime('v_club_transactions', (e) => {
    if (e.record.store === pb.authStore.record?.id) {
      loadData()
    }
  })

  useRealtime('v_club_cards', (e) => {
    if (e.record.store === pb.authStore.record?.id) {
      loadData()
    }
  })

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

  const handleInviteVIP = async (customer: any) => {
    if (!settings || !customer.phone) {
      toast({ description: 'Cliente não possui telefone cadastrado.', variant: 'destructive' })
      return
    }

    setIsInviting((prev) => ({ ...prev, [customer.id]: true }))

    try {
      const inviteUrl = `https://vmodabrasil.goskip.app/v-club/invite/${settings.store_identifier}`
      const message = `Olá ${customer.name}! Você foi selecionado(a) como cliente VIP da ${pb.authStore.record?.name}. Acesse o link para emitir seu *V Club Card* com limite exclusivo e cashback: ${inviteUrl}`

      await pb.send('/backend/v1/evolution_api/send', {
        method: 'POST',
        body: JSON.stringify({
          phone: customer.phone,
          message: message,
          instance_id: 'vmoda',
        }),
      })

      if (customer.v_club_status === 'none' || !customer.v_club_status) {
        await pb.collection('customers').update(customer.id, { v_club_status: 'pending' })
        loadData()
      }

      toast({ description: 'Convite VIP enviado via WhatsApp com sucesso!' })
    } catch (e: any) {
      toast({ description: e.message || 'Erro ao enviar convite VIP', variant: 'destructive' })
    } finally {
      setIsInviting((prev) => ({ ...prev, [customer.id]: false }))
    }
  }

  const isOperator = pb.authStore.record?.unlocked_benefits?.store_role === 'operator'

  const handleRequestRefund = async () => {
    if (!refundTxId) return
    if (isOperator) {
      toast({
        description: 'Operadores não têm permissão para solicitar estornos.',
        variant: 'destructive',
      })
      return
    }
    try {
      setIsRefunding(true)
      await pb.send(`/backend/v1/v-club/transaction/${refundTxId}/refund`, {
        method: 'POST',
      })
      toast({ description: 'Estorno solicitado e processado com sucesso!' })
      setRefundTxId(null)
      loadData()
    } catch (e: any) {
      toast({ description: e.message || 'Erro ao solicitar estorno', variant: 'destructive' })
    } finally {
      setIsRefunding(false)
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
          Gerencie cartões, limites e cashback da sua loja. (BIN 636943 - ID:{' '}
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

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="cards">Emissão e Cartões</TabsTrigger>
          <TabsTrigger value="transactions">Histórico de Transações</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
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
                          <span
                            className={`uppercase text-xs font-bold tracking-wider px-2 py-1 rounded ${
                              c.v_club_status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : c.v_club_status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {c.v_club_status === 'none' || !c.v_club_status
                              ? 'Nenhum'
                              : c.v_club_status === 'pending'
                                ? 'Convidado'
                                : c.v_club_status}
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
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleInviteVIP(c)}
                                disabled={isInviting[c.id] || !c.phone}
                              >
                                <Send className="w-4 h-4 mr-1" />
                                {isInviting[c.id] ? 'Enviando...' : 'Convidar'}
                              </Button>
                              <Button size="sm" onClick={() => handleIssueCard(c.id)}>
                                Emitir
                              </Button>
                            </div>
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
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações e Splits (Asaas)</CardTitle>
              <CardDescription>
                Acompanhe os pagamentos realizados com o V Club Card e o detalhamento do split
                financeiro de comissões e cashback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Líquido Loja</TableHead>
                    <TableHead>Taxas (Plat/Asaas)</TableHead>
                    <TableHead>Cashback / Guia</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhuma transação encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => {
                      const split = tx.split_details || {}
                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="text-sm">
                            {new Date(tx.created).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {tx.expand?.card?.expand?.customer?.name || '-'}
                          </TableCell>
                          <TableCell className="font-bold">{formatPrice(tx.amount)}</TableCell>
                          <TableCell className="text-green-600 font-medium">
                            {formatPrice(split.net_to_store || 0)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            Asaas: {formatPrice(split.asaas_fee || 0)}
                            <br />
                            Plat: {formatPrice(split.platform_fee || 0)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            CB: {formatPrice(split.cashback_fee || 0)}
                            <br />
                            Af/Guia:{' '}
                            {formatPrice((split.guide_fee || 0) + (split.influencer_fee || 0))}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                tx.status === 'approved'
                                  ? 'default'
                                  : tx.status === 'refunded'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                              className={
                                tx.status === 'approved' && split.is_settled
                                  ? 'bg-blue-100 text-blue-800'
                                  : tx.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : ''
                              }
                            >
                              {tx.status === 'approved'
                                ? split.is_settled
                                  ? 'Liquidado'
                                  : 'Aprovado'
                                : tx.status === 'refunded'
                                  ? 'Estornado'
                                  : 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {tx.status === 'approved' && !isOperator && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => setRefundTxId(tx.id)}
                              >
                                Solicitar Estorno
                              </Button>
                            )}
                            {tx.status === 'approved' && isOperator && (
                              <span className="text-xs text-muted-foreground">Acesso Negado</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!refundTxId} onOpenChange={(open) => !open && setRefundTxId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Estorno</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja estornar esta transação? O limite do cartão será restaurado e o
              cashback concedido ao cliente será revertido do saldo atual.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundTxId(null)} disabled={isRefunding}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRequestRefund} disabled={isRefunding}>
              {isRefunding ? 'Processando...' : 'Confirmar Estorno'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
