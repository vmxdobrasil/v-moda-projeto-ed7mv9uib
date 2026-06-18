import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Receipt, Loader2, AlertCircle } from 'lucide-react'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function QRCodeRedirect() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    if (!id) return

    const resolveQR = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/qrcode/${id}`)
        if (!res.ok) {
          throw new Error('QR Code inválido ou expirado')
        }
        const data = await res.json()
        setResult(data)

        // If it's not a card or transaction, redirect immediately
        if (data.type !== 'v_club_card' && data.type !== 'v_club_transaction') {
          window.location.href = data.target
        } else {
          setLoading(false)
        }
      } catch (err) {
        setError(getErrorMessage(err))
        setLoading(false)
      }
    }

    resolveQR()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Resolvendo QR Code...</p>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md shadow-lg border-destructive/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">QR Code Inválido</CardTitle>
            <CardDescription>
              {error || 'Não foi possível encontrar as informações deste código.'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/')}>
              Voltar ao Início
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const { type, data, target } = result

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-xl animate-fade-in-up">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {type === 'v_club_card' ? (
              <CreditCard className="h-8 w-8 text-primary" />
            ) : (
              <Receipt className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {type === 'v_club_card' ? 'Cartão V Club' : 'Transação V Club'}
          </CardTitle>
          <CardDescription>Detalhes da sua interação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {type === 'v_club_card' && data && (
            <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status do Cartão</span>
                <Badge
                  variant={data.status === 'active' ? 'default' : 'destructive'}
                  className="uppercase"
                >
                  {data.status === 'active' ? 'Ativo' : data.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Nível VIP</span>
                <Badge
                  variant={data.vip_level === 'approved' ? 'default' : 'secondary'}
                  className="uppercase bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {data.vip_level === 'approved' ? 'VIP Exclusivo' : 'Pendente'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cliente</span>
                <span className="font-medium">{data.customer_name}</span>
              </div>
            </div>
          )}

          {type === 'v_club_transaction' && data && (
            <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status do Pagamento</span>
                <Badge
                  variant={
                    data.status === 'approved'
                      ? 'default'
                      : data.status === 'denied'
                        ? 'destructive'
                        : 'secondary'
                  }
                  className="uppercase"
                >
                  {data.status === 'approved'
                    ? 'Aprovado'
                    : data.status === 'pending'
                      ? 'Pendente'
                      : data.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valor</span>
                <span className="font-bold text-lg">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    data.amount,
                  )}
                </span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button className="w-full" onClick={() => (window.location.href = target)}>
            Ver no Sistema
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
            Voltar ao Início
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
