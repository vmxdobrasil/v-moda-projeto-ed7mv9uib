import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, Eye, EyeOff, QrCode, RefreshCcw, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/data'
import useAuthStore from '@/stores/useAuthStore'
import { Badge } from '@/components/ui/badge'

export default function VClubWallet() {
  const [cards, setCards] = useState<any[]>([])
  const [cashbacks, setCashbacks] = useState<any[]>([])
  const [showNumber, setShowNumber] = useState<Record<string, boolean>>({})
  const [qrCodeToken, setQrCodeToken] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { toast } = useToast()

  const loadData = async () => {
    if (!user) return
    try {
      const customer = await pb
        .collection('customers')
        .getFirstListItem(`email = "${user.email}"`)
        .catch(() => null)
      if (!customer) return

      const [crds, cbs] = await Promise.all([
        pb
          .collection('v_club_cards')
          .getFullList({ filter: `customer = "${customer.id}"`, expand: 'store' }),
        pb
          .collection('v_club_cashback')
          .getFullList({ filter: `customer = "${customer.id}"`, expand: 'store' }),
      ])
      setCards(crds)
      setCashbacks(cbs)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const toggleShow = (id: string) => {
    setShowNumber((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const generateDynamicQR = () => {
    const token = Math.random().toString(36).substring(2, 15)
    setQrCodeToken(token)
    toast({ description: 'QR Code Dinâmico gerado. Válido por 5 minutos.' })
    setTimeout(() => setQrCodeToken(null), 5 * 60 * 1000)
  }

  const requestPhysical = async (cardId: string) => {
    try {
      await pb.collection('v_club_cards').update(cardId, { physical_status: 'requested' })
      toast({
        description: 'Cartão físico solicitado! Você receberá atualizações sobre a entrega.',
      })
      loadData()
    } catch (e) {
      toast({ description: 'Erro ao solicitar cartão.', variant: 'destructive' })
    }
  }

  const formatCardNumber = (num: string) => {
    return num.replace(/(.{4})/g, '$1 ').trim()
  }

  if (cards.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center animate-fade-in-up">
        <CreditCard className="w-16 h-16 text-muted-foreground/30 mb-6" />
        <h2 className="text-3xl font-serif mb-2">Meu V Club Card</h2>
        <p className="text-muted-foreground max-w-md">
          Você ainda não possui cartões Private Label V Club. Solicite crédito diretamente com suas
          lojas favoritas para liberar benefícios e cashback exclusivos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif tracking-tight mb-2 text-primary uppercase">
          Meu V Club Wallet
        </h1>
        <p className="text-muted-foreground text-lg">
          Seus cartões Private Label, limites e saldos de cashback por loja.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {cards.map((card) => (
          <div key={card.id} className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground p-6 md:p-8 shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <CreditCard className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm uppercase tracking-widest opacity-80 mb-1">
                      Store / Loja
                    </p>
                    <h3 className="text-2xl font-bold">{card.expand?.store?.name || 'V MODA'}</h3>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-0 uppercase tracking-widest text-[10px]"
                    >
                      V Club Card
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs uppercase tracking-widest opacity-80">Número do Cartão</p>
                    <button
                      onClick={() => toggleShow(card.id)}
                      className="opacity-80 hover:opacity-100 transition-opacity"
                    >
                      {showNumber[card.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-xl md:text-2xl tracking-[0.2em] font-medium">
                    {showNumber[card.id]
                      ? formatCardNumber(card.card_number)
                      : `**** **** **** ${card.card_number.slice(-4)}`}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-80 mb-1">
                      Limite Disponível
                    </p>
                    <p className="text-2xl font-bold">{formatPrice(card.available_limit)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Validade</p>
                    <p className="font-mono">
                      {new Date(card.expiration_date).toLocaleDateString('pt-BR', {
                        month: '2-digit',
                        year: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    className="w-full flex flex-col gap-2 h-auto py-4 rounded-xl border-primary bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                    variant="outline"
                    onClick={generateDynamicQR}
                  >
                    <QrCode className="w-6 h-6" />
                    Pagar com QR Code
                  </Button>
                  <Button
                    className="w-full flex flex-col gap-2 h-auto py-4 rounded-xl border-primary bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                    variant="outline"
                    onClick={() => requestPhysical(card.id)}
                    disabled={card.physical_status !== 'none'}
                  >
                    <CreditCard className="w-6 h-6" />
                    {card.physical_status === 'none'
                      ? 'Solicitar Físico'
                      : `Físico: ${card.physical_status}`}
                  </Button>
                </div>

                {qrCodeToken && (
                  <div className="mt-4 p-6 bg-muted rounded-xl flex flex-col items-center justify-center animate-fade-in-up border border-border">
                    <div className="w-48 h-48 bg-white p-4 rounded-lg shadow-sm flex items-center justify-center border">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=VCLUB_PAY_${qrCodeToken}`}
                        alt="QR Code"
                        className="w-full h-full"
                      />
                    </div>
                    <p className="text-sm font-medium mt-4 text-center">
                      Mostre este QR Code no caixa.
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <RefreshCcw className="w-3 h-3" /> Expira em 5 minutos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {cashbacks.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-serif tracking-tight mb-6 uppercase text-primary">
            Saldos de Cashback
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cashbacks.map((cb) => (
              <Card key={cb.id} className="border-accent/20 bg-accent/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-bl-full -mr-4 -mt-4"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    Saldo V Club
                  </CardTitle>
                  <CardDescription className="font-semibold text-foreground">
                    {cb.expand?.store?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent mb-2">
                    {formatPrice(cb.balance)}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-accent" />
                    Uso exclusivo em compras nesta loja.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
