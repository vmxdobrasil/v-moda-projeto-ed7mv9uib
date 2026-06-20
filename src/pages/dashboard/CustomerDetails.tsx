import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Activity,
  History,
  DollarSign,
  MessageSquare,
} from 'lucide-react'

export default function CustomerDetails() {
  const { id } = useParams()
  const [customer, setCustomer] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchDetails = async () => {
      try {
        const cust = await pb
          .collection('customers')
          .getOne(id, { expand: 'manufacturer,affiliate_referrer' })
        setCustomer(cust)

        const phoneDigits = cust.phone?.replace(/\D/g, '')
        if (phoneDigits) {
          const msgs = await pb
            .collection('messages')
            .getFullList({
              filter: `sender_id ~ "${phoneDigits}"`,
              sort: '-created',
            })
            .catch(() => [])
          setMessages(msgs)
        }

        const cards = await pb
          .collection('v_club_cards')
          .getFullList({ filter: `customer = "${id}"` })
          .catch(() => [])
        if (cards.length > 0) {
          const filters = cards.map((c) => `card = "${c.id}"`).join(' || ')
          const txs = await pb
            .collection('v_club_transactions')
            .getFullList({ filter: filters, sort: '-created' })
            .catch(() => [])
          setTransactions(txs)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [id])

  if (loading)
    return (
      <div className="p-8 text-center animate-pulse text-muted-foreground">
        Carregando detalhes do cliente...
      </div>
    )
  if (!customer)
    return (
      <div className="p-8 text-center text-destructive">
        Cliente não encontrado ou sem permissão.
      </div>
    )

  const successfulTxs = transactions.filter((t) => t.status === 'approved')
  const txTotal = successfulTxs.reduce((sum, t) => sum + (t.amount || 0), 0)
  const totalGenerated = (customer.estimated_value || 0) + txTotal

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="..">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{customer.name}</h2>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <User className="h-4 w-4" />
            Adicionado em{' '}
            {format(new Date(customer.created), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <Badge
          variant={
            customer.status === 'closed' || customer.status === 'converted'
              ? 'default'
              : 'secondary'
          }
          className="md:ml-auto text-sm px-3 py-1"
        >
          {customer.status || 'Novo'}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Gerado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalGenerated.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contato</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {customer.phone || customer.email || 'Não informado'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Localização</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {customer.city ? `${customer.city} - ${customer.state || ''}` : 'Não informada'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Histórico & Interações</TabsTrigger>
          <TabsTrigger value="orders">Pedidos & V Club</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> Notas do CRM
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.notes ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{customer.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma nota registrada para este cliente.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Mensagens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 rounded-lg p-3 text-sm ${msg.direction === 'inbound' ? 'bg-muted/50 ml-0 mr-12' : 'bg-primary/10 ml-12 mr-0'}`}
                  >
                    <span className="font-semibold text-xs text-muted-foreground">
                      {msg.direction === 'inbound' ? 'Cliente' : 'Sistema'} •{' '}
                      {format(new Date(msg.created), 'dd/MM/yyyy HH:mm')}
                    </span>
                    <span>{msg.content}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma mensagem registrada nos canais conectados.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" /> Fechamentos e Valor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <span className="font-medium text-muted-foreground">Valor Estimado Manual</span>
                <span className="font-bold text-lg">
                  R$ {(customer.estimated_value || 0).toFixed(2)}
                </span>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Transações V Club Aprovadas
                </h4>
                {successfulTxs.length > 0 ? (
                  successfulTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between text-sm items-center bg-muted/30 p-2 rounded-md"
                    >
                      <span>{format(new Date(tx.created), 'dd/MM/yyyy HH:mm')}</span>
                      <span className="font-medium text-green-600">
                        + R$ {(tx.amount || 0).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma transação V Club registrada para este cliente.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
