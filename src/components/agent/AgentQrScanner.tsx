import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { QrCode, CheckCircle, XCircle, Loader2, ScanLine } from 'lucide-react'
import { verifyDelivery } from '@/services/cargas-transporte'

export function AgentQrScanner() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleVerify = async () => {
    if (!token.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await verifyDelivery(token.trim())
      setResult(res)
      if (res.success) setToken('')
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Token inválido ou não encontrado.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ScanLine className="h-5 w-5" /> Verificação de Entrega
        </h3>
        <p className="text-sm text-muted-foreground">
          Confirme a entrega escaneando ou inserindo o token QR.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCode className="h-5 w-5 text-primary" /> Token de Verificação
          </CardTitle>
          <CardDescription>Digite ou cole o token do QR Code.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Token de verificação..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className="font-mono"
            />
            <Button
              onClick={handleVerify}
              disabled={loading || !token.trim()}
              className="bg-electric text-electric-foreground shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar'}
            </Button>
          </div>

          {result && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg animate-fade-in-up ${
                result.success
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0" />
              )}
              <span className="text-sm font-medium">{result.message}</span>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Como funciona:</p>
            <p>1. O sistema gera um token único para cada carga em trânsito.</p>
            <p>2. Na entrega, escaneie o QR Code ou digite o token.</p>
            <p>3. A confirmação libera a comissão do agente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
