import { useState } from 'react'
import { Link } from 'react-router-dom'
import { QrCode, CheckCircle2, XCircle, ArrowLeft, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { verifyPickupCode } from '@/services/orders'
import { toast } from '@/hooks/use-toast'

export default function RetailerPickupValidation() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    order_id?: string
    total_amount?: number
  } | null>(null)

  const handleVerify = async () => {
    if (!code.trim()) {
      toast({ variant: 'destructive', title: 'Digite o código de retirada' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await verifyPickupCode(code.trim().toUpperCase())
      setResult(res)
      if (res.success) {
        toast({ title: 'Retirada confirmada!', description: res.message })
        setCode('')
      }
    } catch (err: any) {
      setResult({ success: false, message: err?.message || 'Código inválido ou não encontrado.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link to="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-display font-bold">Validar Retirada</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-[#FF6600]" />
            Validação de QR Code de Retirada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Digite o código de retirada apresentado pelo cliente para confirmar a entrega.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: ABC123DEF456"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className="font-mono text-lg tracking-wider"
              maxLength={12}
            />
            <Button
              onClick={handleVerify}
              disabled={loading || !code.trim()}
              className="bg-[#FF6600] hover:bg-[#e65c00] text-white px-8"
            >
              {loading ? 'Validando...' : 'Validar'}
            </Button>
          </div>

          {result && (
            <Alert
              variant={result.success ? 'default' : 'destructive'}
              className="animate-fade-in-up"
            >
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {result.success ? 'Retirada Confirmada!' : 'Falha na Validação'}
              </AlertTitle>
              <AlertDescription>
                {result.message}
                {result.order_id && (
                  <div className="mt-2 text-xs space-y-1">
                    <p>Pedido: #{result.order_id.slice(0, 8).toUpperCase()}</p>
                    {result.total_amount && <p>Valor: R$ {result.total_amount.toFixed(2)}</p>}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t">
            <QrCode className="w-4 h-4" />
            <span>O código é gerado automaticamente após a confirmação do pagamento.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
